import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { shortHex, fmtTime } from '../utils/proof'

function StatCell({ label, value, variant }) {
  return (
    <div className="stat-cell">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${variant || ''}`}>{value ?? '—'}</div>
    </div>
  )
}

export function Dashboard({ qs, account, provider }) {
  const { stats, isPaused, isAdmin, isVerifier, refetch } = qs
  const [commitments, setCommitments] = useState(null)
  const [loadingCom, setLoadingCom]   = useState(false)

  const [queryNullifier, setQueryNullifier] = useState('')
  const [nullifierResult, setNullifierResult] = useState(null)
  const [queryCommitment, setQueryCommitment] = useState('')
  const [commitmentResult, setCommitmentResult] = useState(null)

  // Fetch user commitments
  useEffect(() => {
    if (!account || !qs.getUserCommitments) return
    setLoadingCom(true)
    qs.getUserCommitments(account)
      .then(setCommitments)
      .catch(() => setCommitments([]))
      .finally(() => setLoadingCom(false))
  }, [account, qs.getUserCommitments, stats])

  async function handleCheckNullifier() {
    if (!queryNullifier.trim()) return
    const result = await qs.checkNullifier(queryNullifier.trim())
    setNullifierResult(result)
  }

  async function handleCheckCommitment() {
    if (!queryCommitment.trim()) return
    const result = await qs.checkCommitment(queryCommitment.trim())
    setCommitmentResult(result)
  }

  return (
    <div className="fade-in">
      {/* Protocol stats */}
      <div className="card">
        <div className="card-title">Protocol Statistics</div>
        <div className="stats-grid">
          <StatCell
            label="Proofs Verified"
            value={stats ? stats.proofsVerified.toString() : '…'}
            variant="accent"
          />
          <StatCell
            label="Batches Processed"
            value={stats ? stats.batchesProcessed.toString() : '…'}
          />
          <StatCell
            label="Transactions"
            value={stats ? stats.transactionsProcessed.toString() : '…'}
          />
          <StatCell
            label="Reward Pool"
            value={stats ? parseFloat(ethers.formatEther(stats.rewardPool)).toFixed(4) + ' ETH' : '…'}
            variant="accent2"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${isPaused ? 'badge-red' : 'badge-green'}`}>
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </span>
          {isAdmin    && <span className="badge badge-yellow">ADMIN</span>}
          {isVerifier && <span className="badge badge-blue">VERIFIER</span>}
          <button className="btn btn-ghost text-xs" onClick={refetch} style={{ padding: '2px 10px' }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {/* User commitments */}
      {account && (
        <div className="card">
          <div className="card-title">Your Commitments</div>
          {loadingCom ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="spinner" />
              <span className="text-dim text-sm">Loading…</span>
            </div>
          ) : commitments && commitments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Commitment Hash</th>
                </tr>
              </thead>
              <tbody>
                {commitments.map((c, i) => (
                  <tr key={c}>
                    <td className="text-dim text-xs">{i + 1}</td>
                    <td><span className="hash">{c}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-dim text-sm">No commitments recorded for this address.</p>
          )}
        </div>
      )}

      {/* On-chain lookup */}
      <div className="card">
        <div className="card-title">On-Chain Lookup</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Nullifier check */}
          <div>
            <div className="form-label">Check Nullifier</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="0x…"
                value={queryNullifier}
                onChange={e => { setQueryNullifier(e.target.value); setNullifierResult(null) }}
              />
              <button className="btn btn-ghost" onClick={handleCheckNullifier}
                disabled={!account || !queryNullifier}>
                CHECK
              </button>
            </div>
            {nullifierResult !== null && (
              <div className={`alert ${nullifierResult ? 'alert-warn' : 'alert-success'}`} style={{ marginTop: 8 }}>
                {nullifierResult ? '⚠ CONSUMED — nullifier already used' : '✓ FRESH — nullifier not yet used'}
              </div>
            )}
          </div>

          {/* Commitment check */}
          <div>
            <div className="form-label">Check Commitment</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="0x…"
                value={queryCommitment}
                onChange={e => { setQueryCommitment(e.target.value); setCommitmentResult(null) }}
              />
              <button className="btn btn-ghost" onClick={handleCheckCommitment}
                disabled={!account || !queryCommitment}>
                CHECK
              </button>
            </div>
            {commitmentResult !== null && (
              <div className={`alert ${commitmentResult ? 'alert-success' : 'alert-info'}`} style={{ marginTop: 8 }}>
                {commitmentResult ? '✓ RECORDED on-chain' : '○ NOT FOUND — commitment not yet recorded'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
