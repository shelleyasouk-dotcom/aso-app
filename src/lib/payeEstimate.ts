// ─── PAYE tax / NI / pension ESTIMATOR ─────────────────────────────────────────
//
// IMPORTANT: This produces an ESTIMATE using standard UK 2025/26 rates and
// simple monthly-even-income assumptions. It does NOT account for: cumulative
// tax history, multiple jobs, student loans, tax code adjustments beyond a
// basic personal-allowance read, salary sacrifice, statutory pay, or
// mid-year rate changes. It is intended as a starting figure for staff who
// are on PAYE (director + payroll team), to be checked against Xero / your
// accountant before final payment or HMRC submission.
//
// Update the constants below at the start of each new UK tax year (April).

const TAX_YEAR_LABEL = '2025/26 (estimate — verify annually)'

const STANDARD_PERSONAL_ALLOWANCE_ANNUAL = 12570
const BASIC_RATE_UPPER_ANNUAL = 50270
const HIGHER_RATE_UPPER_ANNUAL = 125140

const NI_PRIMARY_THRESHOLD_MONTHLY = 1048
const NI_UPPER_EARNINGS_LIMIT_MONTHLY = 4189
const NI_MAIN_RATE = 0.08
const NI_UPPER_RATE = 0.02

function personalAllowanceFromTaxCode(taxCode: string | null): number {
  if (!taxCode) return STANDARD_PERSONAL_ALLOWANCE_ANNUAL
  const code = taxCode.trim().toUpperCase()
  if (code === 'BR' || code === 'D0' || code === 'D1' || code === '0T') return 0
  if (code === 'NT') return Infinity
  const digits = code.match(/^(\d+)/)
  if (digits) return parseInt(digits[1], 10) * 10
  return STANDARD_PERSONAL_ALLOWANCE_ANNUAL
}

function monthlyIncomeTax(monthlyGross: number, taxCode: string | null): number {
  const code = taxCode?.trim().toUpperCase() ?? ''
  if (code === 'BR') return monthlyGross * 0.20
  if (code === 'D0') return monthlyGross * 0.40
  if (code === 'D1') return monthlyGross * 0.45
  if (code === 'NT') return 0

  const annualAllowance = personalAllowanceFromTaxCode(taxCode)
  const annualGross = monthlyGross * 12
  let taxable = Math.max(0, annualGross - annualAllowance)

  let tax = 0
  const basicBand = Math.max(0, Math.min(taxable, BASIC_RATE_UPPER_ANNUAL - annualAllowance))
  tax += basicBand * 0.20
  taxable -= basicBand

  const higherBand = Math.max(0, Math.min(taxable, HIGHER_RATE_UPPER_ANNUAL - BASIC_RATE_UPPER_ANNUAL))
  tax += higherBand * 0.40
  taxable -= higherBand

  tax += Math.max(0, taxable) * 0.45

  return tax / 12
}

function monthlyNationalInsurance(monthlyGross: number, niCategory: string | null): number {
  // Simplified — Category A rates only. Other categories (B, C, H, M, etc.)
  // have different thresholds; treat as Category A unless told otherwise.
  if (niCategory && niCategory.toUpperCase() !== 'A') {
    // Fall through to Category A calc as a reasonable default estimate
  }
  if (monthlyGross <= NI_PRIMARY_THRESHOLD_MONTHLY) return 0
  const mainBand = Math.min(monthlyGross, NI_UPPER_EARNINGS_LIMIT_MONTHLY) - NI_PRIMARY_THRESHOLD_MONTHLY
  const upperBand = Math.max(0, monthlyGross - NI_UPPER_EARNINGS_LIMIT_MONTHLY)
  return mainBand * NI_MAIN_RATE + upperBand * NI_UPPER_RATE
}

function monthlyPension(monthlyGross: number, pensionOptedIn: boolean, employeePercent: number): number {
  if (!pensionOptedIn) return 0
  return monthlyGross * (employeePercent / 100)
}

export interface PayeEstimateInput {
  monthlyGross: number
  taxCode: string | null
  niCategory: string | null
  pensionOptedIn: boolean
  pensionEmployeePercent: number
}

export interface PayeEstimateResult {
  taxYearLabel: string
  grossPay: number
  taxDeducted: number
  niDeducted: number
  pensionDeducted: number
  netPay: number
}

export function estimatePaye(input: PayeEstimateInput): PayeEstimateResult {
  const tax = Math.max(0, monthlyIncomeTax(input.monthlyGross, input.taxCode))
  const ni = Math.max(0, monthlyNationalInsurance(input.monthlyGross, input.niCategory))
  const pension = Math.max(0, monthlyPension(input.monthlyGross, input.pensionOptedIn, input.pensionEmployeePercent))
  const net = input.monthlyGross - tax - ni - pension
  return {
    taxYearLabel: TAX_YEAR_LABEL,
    grossPay: input.monthlyGross,
    taxDeducted: round2(tax),
    niDeducted: round2(ni),
    pensionDeducted: round2(pension),
    netPay: round2(net),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
