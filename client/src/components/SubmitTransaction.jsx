import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { buildProofCalldata, deriveNullifier, readJsonFile, shortHex } from '../utils/proof'

function FileZone({ label, hint, loaded, onLoad }) {
  const [dragging, setDragging] = useState(false)

  async function handle(file) {
    try {
      const json = await readJsonFile(file)
      onLoad(json, file.name)
    } catch (e) {
      alert('Could not parse file: ' + e.message)
    }
  }

  return (
    <div className="form-group">
      <div className="form-label">{label}</div>
      <label
        className={`drop-zone ${loaded ? 'loaded' : ''} ${dragging ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
      >
        <input type="file" accept=".json" onChange={e => e.target.files[0] && handle(e.target.files[0])} />
        {loaded
          ? `✓ ${loaded}`
          : <span>{hint}</span>
        }
      </label>
    </div>
  )
}

export function SubmitTransaction({ qs, account }) {
  const [proofJson,   setProofJson]   = useState(null)
  const [proofName,   setProofName]   = useState(null)
  const [publicJson,  setPublicJson]  = useState(null)
  const [publicName,  setPublicName]  = useState(null)

  const [merkleRoot,     setMerkleRoot]     = useState('')
  const [autoNullifier,  setAutoNullifier]  = useState(true)
  const [manualNullifier, setManualNullifier] = useState('')

  const [previewNullifier, setPreviewNullifier] = useState(null)
  const [previewLoading,   setPreviewLoading]   = useState(false)

  const [dryRunResult,  setDryRunResult]  = useState(null)
  const [dryRunLoading, setDryRunLoading] = useState(false)

  // Compute commitment from public signals (since it comes from the proof)
  const commitment = publicJson ? ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      Array(15).fill('uint256'),
      publicJson.slice(0, 15)
    )
  ) : ''

  const canSubmit = proofJson && publicJson && merkleRoot && account && !qs.loading && qs.contract

  // ── Fetch and preview the derived nullifier ─────────────────────────────────
  async function refreshNullifierPreview(signals) {
    if (!account || !qs.contract) {
      setPreviewNullifier(null)
      return
    }
    
    setPreviewLoading(true)
    setPreviewNullifier(null)
    try {
      const currentNonce = await qs.contract.nonces(account)
      const derived = deriveNullifier(signals, account, currentNonce)
      setPreviewNullifier(derived)
    } catch (e) {
      setPreviewNullifier('error: ' + e.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  useEffect(() => {
    if (autoNullifier && publicJson && account && qs.contract) {
      refreshNullifierPreview(publicJson)
    }
  }, [publicJson, account, qs.contract, autoNullifier])

  function handlePublicLoad(json, name) {
    setPublicJson(json)
    setPublicName(name)
    setDryRunResult(null)
  }

  function handleAutoToggle(checked) {
    setAutoNullifier(checked)
    if (checked && publicJson) {
      refreshNullifierPreview(publicJson)
    }
  }

  // ── Dry-run ─────────────────────────────────────────────────────────────────
  async function handleDryRun() {
    if (!proofJson || !publicJson) return
    
    if (!qs.verifyProofOnly) {
      setDryRunResult('error: Verify function not available')
      return
    }
    
    setDryRunLoading(true)
    setDryRunResult(null)
    try {
      const calldata = buildProofCalldata(proofJson, publicJson)
      const ok = await qs.verifyProofOnly(calldata)
      setDryRunResult(ok ? 'valid' : 'invalid')
    } catch (e) {
      setDryRunResult('error: ' + (e.message || 'unknown'))
    } finally {
      setDryRunLoading(false)
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!canSubmit) return
    
    if (!qs.contract) {
      return alert('Contract not initialized. Please connect your wallet.')
    }
    
    qs.clearError()
    qs.clearTx()

    if (!ethers.isHexString(merkleRoot, 32)) return alert('Merkle root must be a 32-byte hex string (0x…)')

    const calldata = buildProofCalldata(proofJson, publicJson)

    // Derive nullifier with current nonce
    let nullifier
    if (autoNullifier) {
      try {
        const currentNonceBigInt = await qs.contract.nonces(account)
        nullifier = deriveNullifier(publicJson, account, currentNonceBigInt)
      } catch (e) {
        return alert('Could not fetch nonce from contract: ' + e.message)
      }
    } else {
      nullifier = manualNullifier.trim()
    }

    if (!ethers.isHexString(nullifier, 32)) return alert('Nullifier must be a 32-byte hex string (0x…)')

    try {
      await qs.submitTransaction(commitment, nullifier, merkleRoot, calldata)
      
      // Refresh preview for next submission
      setPreviewNullifier(null)
      if (publicJson) {
        await refreshNullifierPreview(publicJson)
      }
      
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-title">Submit Private Transaction</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FileZone
            label="proof.json"
            hint="Drop proof.json or click to browse"
            loaded={proofName}
            onLoad={(j, n) => { setProofJson(j); setProofName(n) }}
          />
          <FileZone
            label="public.json  (15 signals)"
            hint="Drop public.json or click to browse"
            loaded={publicName}
            onLoad={handlePublicLoad}
          />
        </div>

        {proofJson && publicJson && (
          <div style={{ marginBottom: 20 }}>
            <button className="btn btn-ghost text-xs" onClick={handleDryRun} disabled={dryRunLoading}>
              {dryRunLoading ? <><div className="spinner" /> VERIFYING…</> : '⚡ DRY-RUN VERIFY (READ-ONLY)'}
            </button>
            {dryRunResult && (
              <span className={`badge ${dryRunResult === 'valid' ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: 10 }}>
                {dryRunResult.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <hr className="divider" />

        {/* Auto-computed Commitment */}
        {publicJson && (
          <div className="form-group">
            <label className="form-label">Commitment (auto-computed from public signals)</label>
            <div className="hash" style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', wordBreak: 'break-all' }}>
              {commitment}
            </div>
            <div className="text-xs text-dim" style={{ marginTop: 4 }}>
              Commitment is derived from the proof's public signals. The same proof files will produce the same commitment.
            </div>
          </div>
        )}

        {/* Merkle root */}
        <div className="form-group">
          <label className="form-label">Merkle Root (bytes32)</label>
          <input
            className="form-input"
            placeholder="0x… (must be anchored by admin)"
            value={merkleRoot}
            onChange={e => setMerkleRoot(e.target.value)}
          />
        </div>

        {/* Nullifier */}
        <div className="form-group">
          <label className="form-label">Nullifier</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11 }}>
              <input
                type="checkbox"
                checked={autoNullifier}
                onChange={e => handleAutoToggle(e.target.checked)}
              />
              Auto-derive from pubSignals + address + nonce
            </label>
            {autoNullifier && publicJson && account && (
              <button
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: 10 }}
                onClick={() => refreshNullifierPreview(publicJson)}
                disabled={previewLoading}
              >
                {previewLoading ? '…' : '↻ REFRESH'}
              </button>
            )}
          </div>

          {autoNullifier ? (
            previewLoading ? (
              <div className="text-xs text-dim">Fetching nonce from contract…</div>
            ) : previewNullifier ? (
              <div
                className="hash"
                style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', wordBreak: 'break-all' }}
              >
                {previewNullifier}
              </div>
            ) : (
              <div className="text-xs text-dim">Loading nullifier preview…</div>
            )
          ) : (
            <input
              className="form-input"
              placeholder="0x… manual nullifier"
              value={manualNullifier}
              onChange={e => setManualNullifier(e.target.value)}
            />
          )}
        </div>

        {/* Public signals preview */}
        {publicJson && (
          <div className="form-group">
            <div className="form-label">Public Signals Preview (15 values)</div>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              padding: '10px 12px',
              maxHeight: 120,
              overflowY: 'auto',
            }}>
              {publicJson.slice(0, 15).map((v, i) => (
                <div key={i} className="text-xs text-dim">
                  [{i.toString().padStart(2, '0')}] <span style={{ color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {qs.error && <div className="alert alert-error">✖ {qs.error}</div>}
        {qs.txHash && (
          <div className="alert alert-success">
            ✓ Transaction confirmed — <span className="hash">{shortHex(qs.txHash)}</span>
          </div>
        )}

        {!account && <div className="alert alert-info">Connect your wallet to submit transactions.</div>}
        {account && !qs.contract && <div className="alert alert-info">Contract not initialized. Check network.</div>}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 4 }}
        >
          {qs.loading ? <><div className="spinner" /> SUBMITTING…</> : '→ SUBMIT TRANSACTION'}
        </button>

        {account && qs.contract && publicJson && (
          <div className="text-xs text-dim" style={{ marginTop: 16, padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <strong>💡 Multiple submissions with same proof:</strong><br />
            The nullifier changes with each nonce, allowing the same proof to be submitted multiple times.
            <br /><br />
            <strong>Nonce flow:</strong><br />
            Tx 1: nonce=0 → nullifier_A<br />
            Tx 2: nonce=1 → nullifier_B (different!)<br />
            Tx 3: nonce=2 → nullifier_C (different!)
          </div>
        )}
      </div>
    </div>
  )
}