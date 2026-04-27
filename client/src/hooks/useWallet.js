import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { TARGET_CHAIN_ID, CHAIN_NAMES } from '../constants/contracts'

export function useWallet() {
  const [account, setAccount]     = useState(null)
  const [provider, setProvider]   = useState(null)
  const [signer, setSigner]       = useState(null)
  const [chainId, setChainId]     = useState(null)
  const [error, setError]         = useState(null)
  const [connecting, setConnecting] = useState(false)

  const isCorrectChain = chainId === TARGET_CHAIN_ID

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask (or compatible wallet) not found. Please install it.')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const prov = new ethers.BrowserProvider(window.ethereum)
      await prov.send('eth_requestAccounts', [])
      const sig  = await prov.getSigner()
      const net  = await prov.getNetwork()
      setProvider(prov)
      setSigner(sig)
      setAccount(await sig.getAddress())
      setChainId(Number(net.chainId))
    } catch (e) {
      setError(e.message || 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
  }, [])

  const switchChain = useCallback(async () => {
    if (!window.ethereum) return
    const hexChain = '0x' + TARGET_CHAIN_ID.toString(16)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChain }],
      })
    } catch (e) {
      setError(`Chain switch failed: ${e.message}`)
    }
  }, [])

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return
    const onAccounts = (accounts) => {
      if (accounts.length === 0) disconnect()
      else setAccount(accounts[0])
    }
    const onChain = (hex) => setChainId(parseInt(hex, 16))
    window.ethereum.on('accountsChanged', onAccounts)
    window.ethereum.on('chainChanged', onChain)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts)
      window.ethereum.removeListener('chainChanged', onChain)
    }
  }, [disconnect])

  // Auto-connect if already authorised
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) connect()
    })
  }, [connect])

  return {
    account,
    provider,
    signer,
    chainId,
    error,
    connecting,
    isCorrectChain,
    chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
    targetChainName: CHAIN_NAMES[TARGET_CHAIN_ID],
    connect,
    disconnect,
    switchChain,
    clearError: () => setError(null),
  }
}
