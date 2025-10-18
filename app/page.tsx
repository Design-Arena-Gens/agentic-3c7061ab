"use client";
import { useEffect } from 'react';
import { useTradingStore } from '../lib/store';
import { TradingPanel } from '../components/TradingPanel';

export default function Page() {
  const init = useTradingStore((s) => s.initialize);

  useEffect(() => {
    init();
  }, [init]);

  return <TradingPanel />;
}
