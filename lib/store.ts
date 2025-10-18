"use client";
import { create } from 'zustand';
import { fetchTickers, Ticker } from './hyperliquid';
import { computeEquity, createInitialState, PaperState } from './paper';
import { stepMeanReversion, StrategyConfig } from './strategy';

export type LogLine = { ts: number; level: 'info' | 'error'; message: string };

export type TradingStore = {
  running: boolean;
  state: PaperState;
  lastSnapshot: PaperState;
  symbols: string[];
  tickers: Record<string, Ticker | undefined>;
  logs: LogLine[];
  cfg: StrategyConfig;
  initialize: () => void;
  toggleRunning: () => void;
  setCfg: (cfg: Partial<StrategyConfig>) => void;
  tick: () => Promise<void>;
};

const defaultCfg: StrategyConfig = { symbol: 'BTC', baseQty: 0.001, rebalanceThresholdPct: 0.5 };

export const useTradingStore = create<TradingStore>((set, get) => ({
  running: false,
  state: createInitialState(10000),
  lastSnapshot: createInitialState(10000),
  symbols: ['BTC', 'ETH', 'SOL'],
  tickers: {},
  logs: [],
  cfg: defaultCfg,
  initialize: () => {
    set({ running: false, state: createInitialState(10000), lastSnapshot: createInitialState(10000) });
  },
  toggleRunning: () => set((s) => ({ running: !s.running })),
  setCfg: (cfg: Partial<StrategyConfig>) => set((s) => ({ cfg: { ...s.cfg, ...cfg } })),
  tick: async () => {
    const { symbols, state, cfg } = get();
    try {
      const list = await fetchTickers([cfg.symbol]);
      const tickers = Object.fromEntries(list.map((t) => [t.symbol, t]));
      const equity = computeEquity(state, tickers);
      const withEquity: PaperState = { ...state, equity };
      const next = stepMeanReversion(withEquity, get().lastSnapshot, tickers[cfg.symbol]!, cfg);
      set((s) => ({
        tickers,
        state: next,
        lastSnapshot: withEquity,
        logs: [
          { ts: Date.now(), level: 'info', message: `Tick ${cfg.symbol} ${tickers[cfg.symbol]?.price ?? 'n/a'} equity=${next.equity}` },
          ...s.logs.slice(0, 199),
        ],
      }));
    } catch (e: any) {
      set((s) => ({
        logs: [
          { ts: Date.now(), level: 'error', message: `Tick failed: ${e?.message ?? e}` },
          ...s.logs.slice(0, 199),
        ],
      }));
    }
  },
}));
