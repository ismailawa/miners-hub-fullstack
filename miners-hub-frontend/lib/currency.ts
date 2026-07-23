const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inputFormatter = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
});

export function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/[^\d.]/g, '');
  const [whole, ...fractionParts] = normalized.split('.');
  const amount = Number(`${whole || '0'}${fractionParts.length ? `.${fractionParts.join('')}` : ''}`);

  return Number.isFinite(amount) ? amount : 0;
}

export function formatCurrency(value: number | string | null | undefined, fallback = currencyFormatter.format(0)): string {
  if (value === null || value === undefined || value === '') return fallback;

  const amount = typeof value === 'string' ? parseCurrencyInput(value) : Number(value);

  return Number.isFinite(amount) ? currencyFormatter.format(amount) : fallback;
}

export function formatCurrencyInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  const amount = typeof value === 'string' ? parseCurrencyInput(value) : Number(value);

  return Number.isFinite(amount) && amount > 0 ? inputFormatter.format(amount) : '';
}
