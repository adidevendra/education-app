import React from 'react';
import { courses } from '../../data/courses';
import { SearchClient } from './SearchClient';

export const dynamic = 'force-static';

export default function CatalogPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const q = (searchParams?.q as string) || '';
  const lang = (searchParams?.lang as string) || '';
  const category = (searchParams?.category as string) || '';

  const filtered = courses.filter((c) => {
    const matchesQ = !q || c.title.toLowerCase().includes(q.toLowerCase()) || (c.tags || '').toLowerCase().includes(q.toLowerCase());
    const matchesCat = !category || (c.department || '').toLowerCase().includes(category.toLowerCase());
    const matchesLang = !lang || lang === 'en'; // placeholder: all sample data is English
    return matchesQ && matchesCat && matchesLang;
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Catalog</h1>
      <p>{filtered.length} results</p>
      {q ? (
        <SearchClient q={q} />
      ) : (
        <ul style={{ marginTop: 16 }}>
        {filtered.map((c) => (
          <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <a href={`/course/${c.id}`} style={{ fontWeight: 600 }}>{c.title}</a>
            <div style={{ color: '#666' }}>{c.university} • {c.level}</div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
