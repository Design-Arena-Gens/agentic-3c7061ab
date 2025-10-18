"use client";
import { useEffect, useRef } from 'react';
import { useTradingStore } from '../lib/store';

export function TradingPanel() {
  const { running, toggleRunning, tick, state, cfg, setCfg, logs } = useTradingStore();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      const loop = async () => {
        await tick();
        timerRef.current = window.setTimeout(loop, 2000);
      };
      loop();
    } else {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [running, tick]);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1>Hyperliquid Paper Trader</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <button onClick={toggleRunning} style={{ padding: '8px 12px' }}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => tick()} style={{ padding: '8px 12px' }}>Manual Tick</button>
        <label>
          Symbol:
          <select value={cfg.symbol} onChange={(e) => setCfg({ symbol: e.target.value })} style={{ marginLeft: 8 }}>
            {['BTC', 'ETH', 'SOL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Base Qty:
          <input type="number" step="0.0001" value={cfg.baseQty}
                 onChange={(e) => setCfg({ baseQty: Number(e.target.value) })}
                 style={{ marginLeft: 8, width: 100 }} />
        </label>
        <label>
          Threshold %:
          <input type="number" step="0.1" value={cfg.rebalanceThresholdPct}
                 onChange={(e) => setCfg({ rebalanceThresholdPct: Number(e.target.value) })}
                 style={{ marginLeft: 8, width: 80 }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Account</h3>
          <div>Cash: ${state.cash.toFixed(2)}</div>
          <div>Equity: ${state.equity.toFixed(2)}</div>
          <h4>Positions</h4>
          {Object.keys(state.positions).length === 0 && <div>No positions</div>}
          {Object.entries(state.positions).map(([sym, qty]) => (
            <div key={sym}>{sym}: {qty}</div>
          ))}
          <h4>Fills</h4>
          <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {state.fills.slice().reverse().map((f) => (
              <div key={f.id}>{new Date(f.ts).toLocaleTimeString()} {f.side.toUpperCase()} {f.qty} {f.symbol} @ {f.fillPrice}</div>
            ))}
          </div>
        </div>
        <div>
          <h3>Logs</h3>
          <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', padding: 8, background: '#fafafa' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.level === 'error' ? '#b00020' : '#333' }}>
                {new Date(l.ts).toLocaleTimeString()} - {l.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
