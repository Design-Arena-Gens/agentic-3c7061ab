export type Ticker = {
  symbol: string;
  price: number;
  ts: number;
};

const HL_REST = 'https://api.hyperliquid.xyz';

export async function fetchTickers(symbols: string[]): Promise<Ticker[]> {
  try {
    const res = await fetch(`${HL_REST}/markets/tickers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Assume format: [{symbol, price, ...}] — adapt gracefully
    const now = Date.now();
    const mapped: Ticker[] = (Array.isArray(data) ? data : []).map((t: any) => ({
      symbol: String(t.symbol ?? t.s ?? 'UNKNOWN'),
      price: Number(t.price ?? t.p ?? 0),
      ts: Number(t.ts ?? now),
    }));
    const picked = symbols.length
      ? mapped.filter((t) => symbols.includes(t.symbol))
      : mapped;
    return picked;
  } catch {
    return simulateTickers(symbols);
  }
}

export function simulateTickers(symbols: string[]): Ticker[] {
  const now = Date.now();
  const base = [
    { symbol: 'BTC', price: 60000 },
    { symbol: 'ETH', price: 3000 },
    { symbol: 'SOL', price: 150 },
  ];
  const pool = symbols.length ? base.filter(b => symbols.includes(b.symbol)) : base;
  return pool.map((b) => ({
    symbol: b.symbol,
    price: Number((b.price * (0.98 + Math.random() * 0.04)).toFixed(2)),
    ts: now,
  }));
}
