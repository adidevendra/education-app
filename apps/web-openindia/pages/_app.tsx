import type { AppProps } from 'next/app';
import '../sentry.client';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
