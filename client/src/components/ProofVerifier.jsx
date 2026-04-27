import { useState } from 'react'
import { buildProofCalldata, readJsonFile } from '../utils/proof'

export function ProofVerifier({ qs, account }) {
  const [proofJson,  setProofJson]  = useState(null)
  const [publicJson, setPublicJson] = useState(null)
  const [proofName,  setProofName]  = useState(null)
  const [publicName, setPublicName] = useState(null)
  const [result,     setResult]     = useState(null)
  const [loading,    setLoading]    = useState(false)

  async function loadFile(field, file) {
    try {
      const json = await readJsonFile(file)
      if (field === 'proof') { setProofJson(json); setProofName(file.name) }
      else                   { setPublicJson(json); setPublicName(file.name) }
      setResult(null)
    } catch (e) {
      alert('Could not parse: ' + e.message)
    }
  }

  async function handleVerify() {
    if (!proofJson || !publicJson) return
    setLoading(true)
    setResult(null)
    try {
      const calldata = buildProofCalldata(proofJson, publicJson)
      const ok = await qs.verifyProofOnly(calldata)
      setResult({ ok, calldata })
    } catch (e) {
      setResult({ ok: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-title">Proof Verifier</div>
        <p className="text-dim text-sm" style={{ marginBottom: 20 }}>
          Verify a Groth16 proof against the on-chain verifier contract without submitting any transaction.
          This is a pure read operation — no gas required.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <div className="form-label">proof.json</div>
            <label className={`drop-zone ${proofName ? 'loaded' : ''}`}>
              <input type="file" accept=".json" onChange={e => e.target.files[0] && loadFile('proof', e.target.files[0])} />
              {proofName || 'Drop proof.json or click'}
            </label>
          </div>
          <div className="form-group">
            <div className="form-label">public.json</div>
            <label className={`drop-zone ${publicName ? 'loaded' : ''}`}>
              <input type="file" accept=".json" onChange={e => e.target.files[0] && loadFile('public', e.target.files[0])} />
              {publicName || 'Drop public.json or click'}
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={!proofJson || !publicJson || loading || !account}
          style={{ marginBottom: 16 }}
        >
          {loading ? <><div className="spinner" /> VERIFYING…</> : '⚡ VERIFY ON-CHAIN'}
        </button>

        {!account && <div className="alert alert-info">Connect wallet to use on-chain verification.</div>}

        {result && (
          <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`}>
            {result.ok
              ? '✓ PROOF VALID — the Groth16 verifier accepts this proof'
              : `✖ PROOF INVALID — ${result.error || 'verifier rejected'}`
            }
          </div>
        )}

        {/* Calldata preview */}
        {result?.calldata && (
          <div className="card" style={{ marginTop: 16, padding: '12px 16px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Calldata Preview</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.8 }}>
              <div><span style={{ color: 'var(--accent-dim)' }}>pA:</span>  [{result.calldata.pA.map(v => v.toString().slice(0, 12) + '…').join(', ')}]</div>
              <div><span style={{ color: 'var(--accent-dim)' }}>pC:</span>  [{result.calldata.pC.map(v => v.toString().slice(0, 12) + '…').join(', ')}]</div>
              <div><span style={{ color: 'var(--accent-dim)' }}>pubSignals[0]:</span> {result.calldata.pubSignals[0]?.toString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Public signals table */}
      {publicJson && (
        <div className="card">
          <div className="card-title">Public Signals ({publicJson.length} values)</div>
          <table className="data-table">
            <thead>
              <tr><th>Index</th><th>Signal Name</th><th>Value</th></tr>
            </thead>
            <tbody>
              {[
                'isValidMerkle','isValidSum','hashedSumsInRange','isValidCommitment',
                'isValidNoise','isValidKey','isValidSecret','isValidMessage',
                'isValidNorm','isValidRange','isValidNTT','isValidNonce',
                'isValidDecryption','nonceHash','root'
              ].map((name, i) => (
                <tr key={i}>
                  <td className="text-dim text-xs">{i}</td>
                  <td className="text-xs" style={{ color: 'var(--accent-dim)' }}>{name}</td>
                  <td className="hash text-xs">{publicJson[i] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
