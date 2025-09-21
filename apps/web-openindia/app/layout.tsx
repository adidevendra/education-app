import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { initI18n } from '@repo/i18n';

export const metadata: Metadata = {
  title: {
    default: 'OpenIndia Learning',
    template: '%s | OpenIndia Learning',
  },
  description: 'Open courses with local language support',
  openGraph: {
    title: 'OpenIndia Learning',
    description: 'Open courses with local language support',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await initI18n({ lng: 'en' });
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ fontWeight: 700 }} aria-label="Home">OpenIndia</a>
          <nav style={{ float: 'right' }}>
            <a href="/catalog" style={{ marginRight: 12 }} aria-current={typeof window!=='undefined' && window.location?.pathname==='/catalog' ? 'page' : undefined}>Catalog</a>
            <a href="#" role="button" aria-label="Change language" style={{ marginRight: 12 }}>EN</a>
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>{children}</main>
        <footer style={{ padding: 16, borderTop: '1px solid #eee' }}>
          © {new Date().getFullYear()} OpenIndia
        </footer>
      </body>
    </html>
  );
}
