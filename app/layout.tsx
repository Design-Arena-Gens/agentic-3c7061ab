import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hyperliquid Paper Trader',
  description: 'Paper trading on Hyperliquid with a simple strategy',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
