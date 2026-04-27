import { shortHex } from '../utils/proof'

export function Header({ wallet, isPaused }) {
  const { account, connecting, isCorrectChain, chainName, targetChainName, connect, disconnect, switchChain } = wallet

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <div className="logo-glyph">QS</div>
          <div>
            <div className="logo-text">QUANTUMSPECTRA</div>
            <div className="logo-sub">POST-QUANTUM ZK PRIVACY LAYER</div>
          </div>
        </div>

        {/* Right side */}
        <div className="header-right">
          {isPaused && (
            <span className="chain-badge paused">⏸ PAUSED</span>
          )}

          {account && !isCorrectChain && (
            <button className="chain-badge wrong" onClick={switchChain} style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--danger)', fontFamily: 'var(--font-body)' }}>
              ⚠ SWITCH TO {targetChainName?.toUpperCase()}
            </button>
          )}

          {account && isCorrectChain && (
            <span className="chain-badge">{chainName}</span>
          )}

          {account ? (
            <button className="btn-connect connected" onClick={disconnect}>
              {shortHex(account, 4)}
            </button>
          ) : (
            <button className="btn-connect" onClick={connect} disabled={connecting}>
              {connecting ? 'CONNECTING…' : 'CONNECT WALLET'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
