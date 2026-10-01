import { formatInr, formatCompactInr, formatPercentage } from './formatters.ts';

// Unit Test Suite for CryptoCore Financial Calculations & Formatters
export function runUnitTests(): { total: number; passed: number; results: { name: string; success: boolean; error?: string }[] } {
  const tests = [
    {
      name: 'Format INR Standard: formatInr(8500000)',
      test: () => {
        const res = formatInr(8500000);
        if (!res.includes('₹') || !res.includes('85,00,000')) {
          throw new Error(`Expected Indian rupee formatting, got: ${res}`);
        }
      },
    },
    {
      name: 'Format Compact INR: 10 Crore formatting',
      test: () => {
        const res = formatCompactInr(100000000); // 10 Cr
        if (!res.includes('Cr') || !res.includes('10.00')) {
          throw new Error(`Expected 10.00 Cr, got: ${res}`);
        }
      },
    },
    {
      name: 'Format Percentage positive and negative prefixes',
      test: () => {
        const pos = formatPercentage(5.42);
        const neg = formatPercentage(-3.18);
        if (!pos.startsWith('+5.42%')) throw new Error(`Expected +5.42%, got: ${pos}`);
        if (!neg.startsWith('-3.18%')) throw new Error(`Expected -3.18%, got: ${neg}`);
      },
    },
    {
      name: 'Graceful Handling of Null or Undefined Price',
      test: () => {
        const res = formatInr(null);
        if (res !== '₹--') throw new Error(`Expected fallback ₹--, got: ${res}`);
      },
    },
  ];

  const results = tests.map((t) => {
    try {
      t.test();
      return { name: t.name, success: true };
    } catch (err: any) {
      return { name: t.name, success: false, error: err.message };
    }
  });

  const passed = results.filter((r) => r.success).length;
  return { total: tests.length, passed, results };
}
