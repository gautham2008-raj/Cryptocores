export function formatInr(value: number | undefined | null, maximumFractionDigits = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹--';
  }

  // Format using Indian numbering system
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: maximumFractionDigits,
  }).format(value);
}

export function formatCompactInr(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹--';
  }

  if (value >= 1e7) {
    // 1 Crore = 10,000,000
    const cr = value / 1e7;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (value >= 1e5) {
    // 1 Lakh = 100,000
    const lakh = value / 1e5;
    return `₹${lakh.toFixed(2)} Lakh`;
  }
  return formatInr(value, 2);
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatNumber(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '--';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '--';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
}
