import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { buildProofCalldata, deriveNullifier, readJsonFile, shortHex } from '../utils/proof'

export function BatchProcessor({ qs, account }) {
  const [entries, setEntries]     = useState([])
  const [batchRoot, setBatchRoot] = useState('')
  const [result, setResult]       = useState(null)

  const isVerifier = qs.isVerifier
  const canProcess = entries.length > 0 && batchRoot && account && isVerifier && !qs.loading && qs.contract

  // ── Add entry ────────────────────────────────────────────────────────────────
  function addEntry() {
    setEntries(prev => [...prev, {
      id:          Date.now() + Math.random(),
      proofJson:   null,
      proofName:   null,
      publicJson:  null,
      publicName:  null,
      commitment:  '',      // Auto-computed from proof
      error:       null,
    }])
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEntry(id, patch) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch, error: null } : e))
  }

  async function loadFile(id, field, file) {
    try {
      const json = await readJsonFile(file)
      
      // Auto-compute commitment from public signals
      if (field === 'publicJson') {
        const commitment = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            Array(15).fill('uint256'),
            json.slice(0, 15)
          )
        )
        updateEntry(id, { 
          [field]: json, 
          [`${field.replace('Json', 'Name')}`]: file.name,
          commitment: commitment,
          error: null 
        })
      } else {
        updateEntry(id, { 
          [field]: json, 
          [`${field.replace('Json', 'Name')}`]: file.name,
          error: null 
        })
      }
    } catch (e) {
      updateEntry(id, { error: e.message })
    }
  }

  // ── Get nullifier for preview with current nonce ────────────────────────────
  async function getNullifierPreview(publicJson, entryIndex) {
    if (!account || !qs.contract || !publicJson) return null
    
    try {
      const baseNonce = await qs.contract.nonces(account)
      // Each entry in the batch gets baseNonce + entryIndex
      return deriveNullifier(publicJson, account, baseNonce + BigInt(entryIndex))
    } catch (e) {
      return 'Error: ' + e.message
    }
  }

  // ── Process batch ─────────────────────────────────────────────────────────────
  async function handleProcess() {
    if (!canProcess) return
    setResult(null)
    qs.clearError()
    qs.clearTx()

    if (!qs.contract) {
      return alert('Contract not initialized. Please connect your wallet and ensure you are on the correct network.')
    }

    // Filter complete entries
    const validEntries = entries.filter(e => e.proofJson && e.publicJson && e.commitment)
    if (validEntries.length === 0) return alert('No complete entries to process')

    // Validate all commitments
    for (const e of validEntries) {
      if (!ethers.isHexString(e.commitment, 32)) {
        return alert(`Entry commitment is not a valid bytes32: ${e.commitment}`)
      }
    }

    try {
      // Fetch base nonce from contract
      const baseNonce = await qs.contract.nonces(account)

      // Build arrays for batch submission
      const commitments = validEntries.map(e => e.commitment)
      
      // Each entry gets baseNonce + index
      const nullifiers = validEntries.map((e, i) => {
        const entryNonce = baseNonce + BigInt(i)
        const nullifier = deriveNullifier(e.publicJson, account, entryNonce)
        return nullifier
      })
      
      const proofs = validEntries.map(e => buildProofCalldata(e.proofJson, e.publicJson))


      await qs.processBatch(commitments, nullifiers, batchRoot, proofs)
      
      console.log('✅ Batch processed successfully!')
      
      // Show success and reset
      setResult(`✅ Batch of ${validEntries.length} transactions processed successfully!`)
      setEntries([]) // Clear entries after successful batch
      
    } catch (error) {
      console.error('❌ Batch processing failed:', error)
      setResult('❌ Batch processing failed: ' + (error.reason || error.message))
    }
  }

  // ── Add multiple entries with same proof ─────────────────────────────────────
  function addMultipleEntries(count = 3) {
    for (let i = 0; i < count; i++) {
      setEntries(prev => [...prev, {
        id:          Date.now() + Math.random() + i,
        proofJson:   null,
        proofName:   null,
        publicJson:  null,
        publicName:  null,
        commitment:  '',
        error:       null,
      }])
    }
  }

  // ── Copy files to all empty entries ─────────────────────────────────────────
  function copyToAllEntries() {
    const firstComplete = entries.find(e => e.proofJson && e.publicJson)
    if (!firstComplete) {
      alert('Load proof.json and public.json in at least one entry first')
      return
    }

    setEntries(prev => prev.map(e => {
      if (!e.proofJson && !e.publicJson) {
        return {
          ...e,
          proofJson: firstComplete.proofJson,
          proofName: firstComplete.proofName,
          publicJson: firstComplete.publicJson,
          publicName: firstComplete.publicName,
          commitment: firstComplete.commitment,
        }
      }
      return e
    }))
  }

  return (
    <div className="fade-in">
      {!isVerifier && account && (
        <div className="alert alert-warn">
          ⚠ Your address does not have the <strong>VERIFIER_ROLE</strong>. Batch processing will be rejected.
        </div>
      )}

      <div className="card">
        <div className="card-title">Batch Rollup Processor</div>

        <p className="text-dim text-sm" style={{ marginBottom: 20 }}>
          Process multiple private transactions as a single zk-rollup batch.
          You can use the <strong>same proof files</strong> for all entries — each
          entry gets a unique nullifier via incrementing nonces.
        </p>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="btn btn-ghost text-xs" onClick={() => addMultipleEntries(3)}>
            + ADD 3 ENTRIES
          </button>
          <button className="btn btn-ghost text-xs" onClick={() => addMultipleEntries(5)}>
            + ADD 5 ENTRIES
          </button>
          <button className="btn btn-ghost text-xs" onClick={copyToAllEntries}>
            📋 COPY FILES TO ALL
          </button>
          <button className="btn btn-ghost text-xs" onClick={addEntry}>
            + ADD SINGLE
          </button>
        </div>

        {/* Batch root */}
        <div className="form-group">
          <label className="form-label">Batch Merkle Root (bytes32)</label>
          <input
            className="form-input"
            placeholder="0x…"
            value={batchRoot}
            onChange={e => setBatchRoot(e.target.value)}
          />
        </div>

        <hr className="divider" />

        {/* Entry list */}
        {entries.length === 0 && (
          <p className="text-dim text-sm" style={{ marginBottom: 16 }}>
            No entries yet — click "Add Entries" to begin.
          </p>
        )}

        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="card"
            style={{ border: '1px solid var(--border-hi)', marginBottom: 12, padding: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-dim)' }}>
                ENTRY [{String(idx + 1).padStart(2, '0')}] — Nonce Offset: +{idx}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: 10 }}
                onClick={() => removeEntry(entry.id)}
              >
                ✕ REMOVE
              </button>
            </div>

            {entry.error && <div className="alert alert-error text-xs">{entry.error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
              {/* proof.json */}
              <div>
                <div className="form-label">proof.json</div>
                <label className={`drop-zone ${entry.proofName ? 'loaded' : ''}`} style={{ padding: '12px', fontSize: 10 }}>
                  <input type="file" accept=".json"
                    onChange={e => e.target.files[0] && loadFile(entry.id, 'proofJson', e.target.files[0])} />
                  {entry.proofName || 'Drop / click'}
                </label>
              </div>

              {/* public.json */}
              <div>
                <div className="form-label">public.json</div>
                <label className={`drop-zone ${entry.publicName ? 'loaded' : ''}`} style={{ padding: '12px', fontSize: 10 }}>
                  <input type="file" accept=".json"
                    onChange={e => e.target.files[0] && loadFile(entry.id, 'publicJson', e.target.files[0])} />
                  {entry.publicName || 'Drop / click'}
                </label>
              </div>

              {/* Commitment (auto-computed) */}
              <div>
                <div className="form-label">Commitment (auto)</div>
                <div className="hash text-xs" style={{ 
                  padding: '8px', 
                  background: 'var(--bg-input)', 
                  border: '1px solid var(--border)',
                  wordBreak: 'break-all',
                  fontSize: '9px'
                }}>
                  {entry.commitment || '—'}
                </div>
              </div>
            </div>

            {/* Derived nullifier preview */}
            {entry.publicJson && account && qs.contract && (
              <div style={{ marginTop: 8, padding: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="text-xs text-dim">
                  <strong>Nullifier (nonce offset +{idx}):</strong>
                </div>
                <div className="hash text-xs" style={{ wordBreak: 'break-all' }}>
                  {deriveNullifier(entry.publicJson, account, BigInt(idx))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            className="btn btn-success"
            onClick={handleProcess}
            disabled={!canProcess}
            style={{ flex: 1 }}
          >
            {qs.loading
              ? <><div className="spinner" /> PROCESSING…</>
              : `→ PROCESS BATCH (${entries.filter(e => e.proofJson && e.publicJson && e.commitment).length} entries)`
            }
          </button>
        </div>

        {qs.error  && <div className="alert alert-error"  style={{ marginTop: 16 }}>✖ {qs.error}</div>}
        {result    && <div className="alert alert-success" style={{ marginTop: 16 }}>{result}</div>}
        {qs.txHash && (
          <div className="alert alert-info" style={{ marginTop: 8 }}>
            TX: <span className="hash">{qs.txHash}</span>
          </div>
        )}

        {/* Batch explanation */}
        {entries.length > 0 && (
          <div className="text-xs text-dim" style={{ marginTop: 16, padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <strong>📦 Batch Nullifier Logic:</strong><br />
            If current nonce = N and you have 3 entries:<br />
            • Entry 0 uses nonce = N + 0<br />
            • Entry 1 uses nonce = N + 1<br />
            • Entry 2 uses nonce = N + 2<br />
            <br />
            After successful batch: nonce becomes N + 3<br />
            <br />
            <strong>🎯 Using same proof for all entries:</strong><br />
            • Load proof.json + public.json in first entry<br />
            • Click "COPY FILES TO ALL" to duplicate<br />
            • Each entry gets a unique nullifier (different nonce)<br />
            • Submit batch — all entries processed at once!
          </div>
        )}
      </div>
    </div>
  )
}