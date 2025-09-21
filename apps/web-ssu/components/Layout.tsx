import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }>=({ children })=>{
  const router = useRouter();
  const link = (href: string, label: string) => (
    <Link href={href} aria-current={router.pathname===href? 'page': undefined} className={['', router.pathname===href?'active':''].join(' ')}>{label}</Link>
  );
  return (
    <div className="app-shell" role="application">
      <aside className="sidebar" aria-label="Primary">
        <h1>SSU Portal</h1>
        <nav className="nav" role="navigation" aria-label="Main">
          {link('/queue', 'Queue')}
          {link('/students', 'Students')}
          {link('/interventions', 'Interventions')}
          {link('/office-hours', 'Office Hours')}
        </nav>
      </aside>
      <main className="content" tabIndex={-1}>{children}</main>
    </div>
  );
};
