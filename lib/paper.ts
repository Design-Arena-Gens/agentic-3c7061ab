import { Ticker } from './hyperliquid';

export type OrderSide = 'buy' | 'sell';

export type PaperOrder = {
  id: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  price: number;
  ts: number;
};

export type Fill = PaperOrder & { fillPrice: number };

export type PaperState = {
  cash: number;
  positions: Record<string, number>;
  orders: PaperOrder[];
  fills: Fill[];
  equity: number;
};

export function createInitialState(cash = 10000): PaperState {
  return { cash, positions: {}, orders: [], fills: [], equity: cash };
}

export function placeMarket(state: PaperState, symbol: string, side: OrderSide, qty: number, price: number): PaperState {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const order: PaperOrder = { id, symbol, side, qty, price, ts: Date.now() };
  const fillPrice = price;
  const signedQty = side === 'buy' ? qty : -qty;
  const cost = fillPrice * qty;
  const cash = side === 'buy' ? state.cash - cost : state.cash + cost;
  const positions = { ...state.positions, [symbol]: (state.positions[symbol] ?? 0) + signedQty };
  const fills = [...state.fills, { ...order, fillPrice }];
  const equity = computeEquity({ ...state, cash, positions, fills }, {});
  return { ...state, cash, positions, fills, equity };
}

export function computeEquity(state: PaperState, tickersBySymbol: Record<string, Ticker | undefined>): number {
  let equity = state.cash;
  for (const [symbol, qty] of Object.entries(state.positions)) {
    const px = tickersBySymbol[symbol]?.price ?? 0;
    equity += qty * px;
  }
  return Number(equity.toFixed(2));
}
