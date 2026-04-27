import { useState } from 'react'
import { Header }           from './components/Header.jsx'
import { Dashboard }        from './components/Dashboard.jsx'
import { SubmitTransaction } from './components/SubmitTransaction.jsx'
import { BatchProcessor }   from './components/BatchProcessor.jsx'
import { AdminPanel }       from './components/AdminPanel.jsx'
import { ProofVerifier }    from './components/ProofVerifier.jsx'
import { useWallet }        from './hooks/useWallet.js'
import { useQuantumSpectra } from './hooks/useQuantumSpectra.js'
import { QUANTUM_SPECTRA_ADDRESS, TARGET_CHAIN_ID, CHAIN_NAMES } from './constants/contracts.js'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'submit',    label: 'Submit Tx' },
  { id: 'batch',     label: 'Batch Rollup' },
  { id: 'verify',    label: 'Verify Proof' },
  { id: 'admin',     label: 'Admin' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const wallet = useWallet()
  const qs     = useQuantumSpectra({
    signer:   wallet.signer,
    provider: wallet.provider,
    account:  wallet.account,
  })

  const isZeroAddr = QUANTUM_SPECTRA_ADDRESS === '0x0000000000000000000000000000000000000000'

  return (
    <div className="app-shell">
      <Header wallet={wallet} isPaused={qs.isPaused} />

      <main className="app-body">
        {/* Contract address warning */}
        {isZeroAddr && (
          <div className="alert alert-warn" style={{ marginBottom: 20 }}>
            ⚠ No contract address configured. Set <code>VITE_QUANTUM_SPECTRA_ADDRESS</code> in your{' '}
            <code>.env</code> file or Netlify environment variables.
          </div>
        )}

        {/* Wallet error */}
        {wallet.error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {wallet.error}
            <button
              onClick={wallet.clearError}
              style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >✕</button>
          </div>
        )}

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              {t.id === 'admin' && qs.isAdmin && (
                <span className="badge badge-yellow" style={{ marginLeft: 6, padding: '1px 5px', fontSize: 8 }}>
                  ADMIN
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'dashboard' && (
          <Dashboard qs={qs} account={wallet.account} provider={wallet.provider} />
        )}
        {activeTab === 'submit' && (
          <SubmitTransaction qs={qs} account={wallet.account} />
        )}
        {activeTab === 'batch' && (
          <BatchProcessor qs={qs} account={wallet.account} />
        )}
        {activeTab === 'verify' && (
          <ProofVerifier qs={qs} account={wallet.account} />
        )}
        {activeTab === 'admin' && (
          <AdminPanel qs={qs} account={wallet.account} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 20px',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: 'var(--text-dim)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span>QUANTUMSPECTRA — POST-QUANTUM ZK PRIVACY LAYER</span>
        <span>
          NETWORK: {CHAIN_NAMES[TARGET_CHAIN_ID] || `CHAIN ${TARGET_CHAIN_ID}`}
          {' · '}
          CONTRACT: {QUANTUM_SPECTRA_ADDRESS.slice(0, 10)}…
        </span>
      </footer>
    </div>
  )
}
