import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import {
  QUANTUM_SPECTRA_ADDRESS,
  QUANTUM_SPECTRA_ABI,
  GROTH16_VERIFIER_ADDRESS,
  GROTH16_VERIFIER_ABI,
} from '../constants/contracts'

function useContract(address, abi, signerOrProvider) {
  return useMemo(() => {
    if (!signerOrProvider || !address || address === ethers.ZeroAddress) return null
    try {
      return new ethers.Contract(address, abi, signerOrProvider)
    } catch {
      return null
    }
  }, [address, abi, signerOrProvider])
}

export function useQuantumSpectra({ signer, provider, account }) {
  const [stats, setStats]         = useState(null)
  const [isPaused, setIsPaused]   = useState(false)
  const [isAdmin, setIsAdmin]     = useState(false)
  const [isVerifier, setIsVerifier] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [txHash, setTxHash]       = useState(null)
  const [error, setError]         = useState(null)

  // Read contract uses provider; write contract uses signer
  const readContract  = useContract(QUANTUM_SPECTRA_ADDRESS, QUANTUM_SPECTRA_ABI, provider)
  const writeContract = useContract(QUANTUM_SPECTRA_ADDRESS, QUANTUM_SPECTRA_ABI, signer)


  const fetchStats = useCallback(async () => {
    if (!readContract) return
    try {
      const [s, paused] = await Promise.all([
        readContract.getStats(),
        readContract.paused(),
      ])
      setStats({
        proofsVerified:        s.proofsVerified,
        batchesProcessed:      s.batchesProcessed,
        transactionsProcessed: s.transactionsProcessed,
        rewardPool:            s.rewardPool,
      })
      setIsPaused(paused)
    } catch (e) {
      console.warn('fetchStats:', e.message)
    }
  }, [readContract])

  // ── Fetch role info for connected account ───────────────────────────────────
  const fetchRoles = useCallback(async () => {
    if (!readContract || !account) return
    try {
      const [adminRole, verifierRole] = await Promise.all([
        readContract.ADMIN_ROLE(),
        readContract.VERIFIER_ROLE(),
      ])
      const [admin, verifier] = await Promise.all([
        readContract.hasRole(adminRole, account),
        readContract.hasRole(verifierRole, account),
      ])
      setIsAdmin(admin)
      setIsVerifier(verifier)
    } catch (e) {
      console.warn('fetchRoles:', e.message)
    }
  }, [readContract, account])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchRoles() }, [fetchRoles])

  
  const clear = () => { setError(null); setTxHash(null) }

  async function send(fn, ...args) {
    clear()
    setLoading(true)
    try {
      const tx = await fn(...args)
      setTxHash(tx.hash)
      await tx.wait()
      await fetchStats()
      return tx
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || 'Transaction failed'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }

  // ── Submit single transaction ────────────────────────────────────────────────
  const submitTransaction = useCallback(
    (commitment, nullifier, merkleRoot, proof) =>
      send(
        writeContract.submitTransaction.bind(writeContract),
        commitment,
        nullifier,
        merkleRoot,
        proof
      ),
    [writeContract] // eslint-disable-line
  )

  // ── Process batch ────────────────────────────────────────────────────────────
  const processBatch = useCallback(
    (commitments, nullifiers, batchRoot, proofs) =>
      send(
        writeContract.processBatch.bind(writeContract),
        commitments,
        nullifiers,
        batchRoot,
        proofs
      ),
    [writeContract] // eslint-disable-line
  )

  // ── Anchor Merkle root ───────────────────────────────────────────────────────
  const anchorMerkleRoot = useCallback(
    (root) => send(writeContract.anchorMerkleRoot.bind(writeContract), root),
    [writeContract] // eslint-disable-line
  )

  // ── Fund reward pool ─────────────────────────────────────────────────────────
  const fundRewardPool = useCallback(
    (ethAmount) =>
      send(
        writeContract.fundRewardPool.bind(writeContract),
        { value: ethers.parseEther(ethAmount) }
      ),
    [writeContract] // eslint-disable-line
  )

  // ── Set reward BPS ────────────────────────────────────────────────────────────
  const setRewardBps = useCallback(
    (bps) => send(writeContract.setVerifierRewardBps.bind(writeContract), bps),
    [writeContract] // eslint-disable-line
  )

  // ── Pause / Unpause ───────────────────────────────────────────────────────────
  const pauseContract   = useCallback(() => send(writeContract.pause.bind(writeContract)),   [writeContract]) // eslint-disable-line
  const unpauseContract = useCallback(() => send(writeContract.unpause.bind(writeContract)), [writeContract]) // eslint-disable-line

  // ── Query helpers ─────────────────────────────────────────────────────────────
  const checkNullifier = useCallback(
    (nullifier) => readContract?.isNullifierUsed(nullifier),
    [readContract]
  )

  const checkCommitment = useCallback(
    (commitment) => readContract?.isCommitmentRecorded(commitment),
    [readContract]
  )

  const getUserCommitments = useCallback(
    (addr) => readContract?.getUserCommitments(addr || account),
    [readContract, account]
  )

  const verifyProofOnly = useCallback(
    (proof) => readContract?.verifyProofOnly(proof),
    [readContract]
  )

  const isRootAnchored = useCallback(
    (root) => readContract?.anchoredRoots(root),
    [readContract]
  )

  return {
    stats,
    isPaused,
    isAdmin,
    isVerifier,
    loading,
    txHash,
    error,
    
    contract: writeContract,
    // actions
    submitTransaction,
    processBatch,
    anchorMerkleRoot,
    fundRewardPool,
    setRewardBps,
    pauseContract,
    unpauseContract,
    // queries
    checkNullifier,
    checkCommitment,
    getUserCommitments,
    verifyProofOnly,
    isRootAnchored,
    // manual refresh
    refetch: fetchStats,
    clearError: () => setError(null),
    clearTx: () => setTxHash(null),
  }
}
