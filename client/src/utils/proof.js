import { ethers } from 'ethers'

/**
 * Convert a snarkjs-generated proof.json + public.json
 * into the tuple expected by the Groth16Verifier / QuantumSpectra contract.
 *
 * snarkjs proof format:
 *   { pi_a: [x, y, "1"], pi_b: [[x0,y0],[x1,y1],["1","0"]], pi_c: [x, y, "1"] }
 *
 * Solidity Proof struct:
 *   { pA: [2], pB: [2][2], pC: [2], pubSignals: [15] }
 *
 * NOTE: pi_b coordinates are swapped (Ethereum uses the negated G2 point).
 */
export function buildProofCalldata(proofJson, publicSignals) {
  const { pi_a, pi_b, pi_c } = proofJson

  return {
    pA: [BigInt(pi_a[0]), BigInt(pi_a[1])],
    // G2 point: swap inner pairs for the Ethereum bn254 pairing convention
    pB: [
      [BigInt(pi_b[0][1]), BigInt(pi_b[0][0])],
      [BigInt(pi_b[1][1]), BigInt(pi_b[1][0])],
    ],
    pC: [BigInt(pi_c[0]), BigInt(pi_c[1])],
    pubSignals: publicSignals.map(BigInt),
  }
}

export function deriveNullifier(pubSignals, sender, nonce) {
  return ethers.solidityPackedKeccak256(
    [
      ...Array(pubSignals.length).fill('uint256'),
      'address',
      'uint256',
    ],
    [
      ...pubSignals.map(BigInt),
      sender,
      BigInt(nonce),
    ]
  )
}

/**
 * Parse a JSON file from a File object → JavaScript object.
 */
export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Shorten a hex string for display.
 */
export function shortHex(hex, chars = 6) {
  if (!hex) return '—'
  return `${hex.slice(0, chars + 2)}…${hex.slice(-chars)}`
}

/**
 * Format wei → ETH with 6 dp.
 */
export function formatEth(wei) {
  if (!wei && wei !== 0n) return '—'
  return parseFloat(ethers.formatEther(wei)).toFixed(6) + ' ETH'
}

/**
 * Unix timestamp → locale date-time string.
 */
export function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(Number(ts) * 1000).toLocaleString()
}
