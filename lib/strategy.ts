import { Ticker } from './hyperliquid';
import { PaperState, placeMarket } from './paper';

export type StrategyConfig = {
  symbol: string;
  baseQty: number;
  rebalanceThresholdPct: number; // e.g. 1 means 1%
};

export function stepMeanReversion(state: PaperState, last: PaperState, ticker: Ticker, cfg: StrategyConfig): PaperState {
  const { symbol, baseQty, rebalanceThresholdPct } = cfg;
  if (ticker.symbol !== symbol) return state;

  // naive mean reversion: if price decreased more than threshold since last step -> buy; if increased -> sell
  const prevEquity = last.equity;
  const nowEquity = state.equity;
  const changePct = prevEquity === 0 ? 0 : (nowEquity - prevEquity) / prevEquity * 100;

  if (changePct <= -rebalanceThresholdPct) {
    return placeMarket(state, symbol, 'buy', baseQty, ticker.price);
  }
  if (changePct >= rebalanceThresholdPct) {
    return placeMarket(state, symbol, 'sell', baseQty, ticker.price);
  }
  return state;
}
