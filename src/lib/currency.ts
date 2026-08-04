// Multi-currency formatting for Work Versely Global

export interface SalaryInfo {
  min: number;
  max: number;
  period: 'year' | 'month' | 'hour';
  currency: string;
}

export function formatSalary(salary: SalaryInfo, locale: string = 'en-US'): string {
  const { min, max, period, currency } = salary;
  const fmtMin = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(min);

  const fmtMax = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(max);

  const periodLabel = period === 'year' ? '/yr' : period === 'month' ? '/mo' : '/hr';
  return `${fmtMin} - ${fmtMax}${periodLabel}`;
}

export function formatSalaryShort(salary: SalaryInfo, locale: string = 'en-US'): string {
  const { min, max, currency } = salary;
  const fmtMin = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(min);

  const fmtMax = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(max);

  return `${fmtMin} - ${fmtMax}`;
}

// Get currency symbol for display
export function getCurrencySymbol(code: string): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code })
      .formatToParts(0)
      .find(p => p.type === 'currency')?.value || code;
  } catch {
    return code;
  }
}
