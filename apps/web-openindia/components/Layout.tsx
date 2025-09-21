import React from 'react';
import Head from 'next/head';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({children, title = 'OpenIndia'}: Props) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">OpenIndia</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-600">© {new Date().getFullYear()} OpenIndia — Demo UI</div>
      </footer>
    </div>
  );
}
