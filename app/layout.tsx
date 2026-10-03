import type { Metadata } from "next";
import Link from "next/link";
import { StockQuotesProvider } from "@/components/LiveStockPrice";
import "./globals.css";
export const metadata: Metadata = {
  title: "StockLens | Stock Analysis Dashboard",
  description: "Excel-powered stock analysis dashboard",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand">
              <span className="brand-icon">▥</span>Stock<span>Lens</span>
            </Link>
            <nav>
              <Link href="/">Dashboard</Link>
            </nav>
            <span className="source-pill">
              <i /> DRIVE + YAHOO
            </span>
          </div>
        </header>
        <main className="main-shell"><StockQuotesProvider>{children}</StockQuotesProvider></main>
        <footer className="footer">
          StockLens · บทวิเคราะห์จาก Excel / Google Drive · Yahoo Finance /
          Forex Factory · ไม่มีการส่งคำสั่งซื้อขาย
        </footer>
      </body>
    </html>
  );
}
