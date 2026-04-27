import { useState } from 'react'
import { ethers } from 'ethers'
import { shortHex } from '../utils/proof'

export function AdminPanel({ qs, account }) {
  const { isAdmin, isPaused, loading, error, txHash } = qs

  const [newRoot,      setNewRoot]    = useState('')
  const [fundAmount,   setFundAmount] = useState('')
  const [newBps,       setNewBps]     = useState('')
  const [rootCheckResult, setRootCheckResult] = useState(null)
  const [rootToCheck,  setRootToCheck] = useState('')

  async function handleAnchor() {
    if (!ethers.isHexString(newRoot, 32)) return alert('Root must be 32-byte hex (0x…)')
    qs.clearError(); qs.clearTx()
    try { await qs.anchorMerkleRoot(newRoot); setNewRoot('') } catch {}
  }

  async function handleFund() {
    if (!fundAmount || isNaN(parseFloat(fundAmount))) return alert('Enter a valid ETH amount')
    qs.clearError(); qs.clearTx()
    try { await qs.fundRewardPool(fundAmount); setFundAmount('') } catch {}
  }

  async function handleSetBps() {
    const bps = parseInt(newBps)
    if (isNaN(bps) || bps < 0 || bps > 1000) return alert('BPS must be 0–1000')
    qs.clearError(); qs.clearTx()
    try { await qs.setRewardBps(bps); setNewBps('') } catch {}
  }

  async function handleCheckRoot() {
    if (!rootToCheck.trim()) return
    const anchored = await qs.isRootAnchored(rootToCheck.trim())
    setRootCheckResult(anchored)
  }

  if (!account) {
    return (
      <div className="fade-in">
        <div className="alert alert-info">Connect your wallet to access admin functions.</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="fade-in">
        <div className="alert alert-warn">
          ⚠ Address <span className="hash">{shortHex(account)}</span> does not hold <strong>ADMIN_ROLE</strong>.
          Admin panel is restricted.
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Global feedback */}
      {error   && <div className="alert alert-error">✖ {error}</div>}
      {txHash  && <div className="alert alert-success">✓ TX confirmed: <span className="hash">{shortHex(txHash)}</span></div>}

      {/* Merkle root anchoring */}
      <div className="card">
        <div className="card-title">Anchor Merkle Root</div>
        <p className="text-dim text-sm" style={{ marginBottom: 16 }}>
          Provers can only submit transactions against anchored roots.
          Anchor a root here before users call <code>submitTransaction</code>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="form-label">Root (bytes32)</div>
            <input
              className="form-input"
              placeholder="0x…"
              value={newRoot}
              onChange={e => setNewRoot(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleAnchor}
              disabled={loading || !newRoot}
            >
              {loading ? <><div className="spinner" /> ANCHORING…</> : '⚓ ANCHOR'}
            </button>
          </div>
        </div>

        <hr className="divider" style={{ margin: '16px 0' }} />

        {/* Check root status */}
        <div className="form-label">Check if Root is Anchored</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            placeholder="0x…"
            value={rootToCheck}
            onChange={e => { setRootToCheck(e.target.value); setRootCheckResult(null) }}
          />
          <button className="btn btn-ghost" onClick={handleCheckRoot} disabled={!rootToCheck}>
            CHECK
          </button>
        </div>
        {rootCheckResult !== null && (
          <div className={`alert ${rootCheckResult ? 'alert-success' : 'alert-warn'}`} style={{ marginTop: 8 }}>
            {rootCheckResult ? '✓ ANCHORED' : '✗ NOT ANCHORED'}
          </div>
        )}
      </div>

      {/* Reward pool */}
      <div className="card">
        <div className="card-title">Reward Pool Management</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="form-label">Fund Amount (ETH)</div>
            <input
              className="form-input"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-success"
              onClick={handleFund}
              disabled={loading || !fundAmount}
            >
              {loading ? <><div className="spinner" /> FUNDING…</> : '↑ FUND POOL'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="form-label">Verifier Reward (BPS, max 1000 = 10%)</div>
            <input
              className="form-input"
              type="number"
              step="1"
              min="0"
              max="1000"
              placeholder="100"
              value={newBps}
              onChange={e => setNewBps(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-ghost"
              onClick={handleSetBps}
              disabled={loading || !newBps}
            >
              SET BPS
            </button>
          </div>
        </div>
      </div>

      {/* Pause control */}
      <div className="card">
        <div className="card-title">Emergency Controls</div>
        <p className="text-dim text-sm" style={{ marginBottom: 16 }}>
          Pause halts all proof submissions and batch processing.
          Emergency withdraw is only available while paused.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {isPaused ? (
            <button
              className="btn btn-success"
              onClick={() => { qs.clearError(); qs.clearTx(); qs.unpauseContract() }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> …</> : '▶ UNPAUSE CONTRACT'}
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => { qs.clearError(); qs.clearTx(); qs.pauseContract() }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> …</> : '⏸ PAUSE CONTRACT'}
            </button>
          )}
        </div>
        {isPaused && (
          <div className="alert alert-warn" style={{ marginTop: 12 }}>
            Contract is paused. All transactions are blocked.
          </div>
        )}
      </div>
    </div>
  )
}
