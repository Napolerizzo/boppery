// Grand Unified Bop Formula (GUBF) v3
// All calculations run client-side

const LOG_A = 28 / (Math.log(19) - Math.log(4))
const LOG_C = 2 - LOG_A * Math.log(4)

export function scoreRaw(bp: number): number {
  if (bp <= 0) return bp
  if (bp <= 4) return 1
  let s = LOG_A * Math.log(bp - 1) + LOG_C
  if (s > 100) return 100 + (s - 100) * 0.3
  return Math.max(1, s)
}

export function getCeiling(ts: number, mo: number, xb: number): number {
  if (xb > 0) return 100
  if (mo > 0) return 60
  if (ts > 0) return 35
  return 1
}

export function getBopType(ts_p: number, mo_p: number, xb_p: number, raw: number): string {
  if (!raw) return 'No Activity'
  const rTS = ts_p / raw, rMO = mo_p / raw, rXB = xb_p / raw
  if (rTS === 1) return 'Theoretical Bop'
  if (rTS > 0.60) return 'Talking Stage Bop'
  if (rXB > 0.50) return 'Physical Bop'
  if (rMO > 0.40) return 'Makeout Bop'
  return 'Balanced Bop'
}

export function getArchetype(op: number, ceiling: number, bopType: string): string {
  if (op <= -100) return 'Bop Manqué — Celsius Zone. Non-canonical.'
  if (op < 3) return 'Demi-Bop — The wavefunction has not collapsed.'
  if (bopType === 'Theoretical Bop') return 'Theoretical Bop — Volume without depth. The ceiling sees you.'
  if (op > 90) return 'Bop Absolu — Beyond normal bop physics.'
  if (op > 75) return 'Senior Bop — Exceptional history. High operational capacity.'
  if (op > 60) return 'Active Bop — Above average, meaningfully experienced.'
  if (op > 45) return 'Standard Bop — Functional. Average to above average.'
  if (op > 30) return 'Developing Bop — History present.'
  return 'Emerging Bop — Maximum marginal returns await.'
}

export function getStatus(op: number): string {
  if (op <= -100) return 'Celsius Zone'
  if (op < 3) return 'Ground State'
  if (op < 15) return 'Minimal Activity'
  if (op < 30) return 'Below Average'
  if (op < 45) return 'Average'
  if (op < 60) return 'Above Average'
  if (op < 75) return 'High Activity'
  if (op < 90) return 'Exceptional'
  return 'Black Hole Territory'
}

export interface ScoreResult {
  bp_raw: number
  bp_eff: number
  bp_canon: number
  bp_op: number
  frozen: number
  ceiling: number
  bop_type: string
  archetype: string
  status: string
}

export function calcScore(
  ts: number, mo: number, xb3: number, xb4: number,
  dated: number, unres: number,
  // optional modifiers
  edi_override?: number,
  scbu?: number,
  gac?: boolean,
  vcc_frac?: number,
  hrdm_months?: number
): ScoreResult | null {
  const xb = xb3 + xb4
  const ts_p = ts * 5, mo_p = mo * 10, xb_p = xb * 20
  const bp_raw = ts_p + mo_p + xb_p
  if (!bp_raw) return null

  const psi = ts > 0 ? Math.min(1 + 0.3 * (dated / ts), 1.30) : 1.30
  const rho = 0.85
  const bp_eff = bp_raw * psi * rho

  const raw_s = scoreRaw(bp_eff)
  const ceiling = getCeiling(ts, mo, xb)
  const canon = Math.min(raw_s, ceiling)

  // operational modifiers
  const edi = edi_override !== undefined ? edi_override : Math.min((unres / 24) * 0.7, 1.0)
  const edi_pen = canon * 0.15 * edi
  const scbu_pen = scbu ? canon * scbu : 0
  const gac_pen = gac ? canon * 0.80 * 0.50 : 0
  const vcc_bon = vcc_frac ? canon * 0.24 * vcc_frac : 0
  const hrdm_decay = hrdm_months ? canon * 0.005 * hrdm_months : 0

  const op = canon - edi_pen - scbu_pen - gac_pen + vcc_bon - hrdm_decay
  const frozen = parseFloat((canon - op).toFixed(2))

  const bop_type = getBopType(ts_p, mo_p, xb_p, bp_raw)

  return {
    bp_raw,
    bp_eff: parseFloat(bp_eff.toFixed(2)),
    bp_canon: parseFloat(canon.toFixed(2)),
    bp_op: parseFloat(op.toFixed(2)),
    frozen,
    ceiling,
    bop_type,
    archetype: getArchetype(op, ceiling, bop_type),
    status: getStatus(op)
  }
}
