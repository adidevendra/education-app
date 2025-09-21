"use client";
import React, { useEffect, useState } from 'react';
import { searchCourses, type CourseSearchHit } from '../../../../packages/sdk/src/clients/openindia';

type Hit = CourseSearchHit;

export function SearchClient({ q }: { q: string }) {
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!q) {
          setHits([]);
          return;
        }
        const response = await searchCourses({ q });
        if (!mounted) return;
        setHits(response.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Search failed');
        setHits([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [q]);

  if (error) return <div role="status">Search error: {error}</div>;
  if (hits == null) return <div role="status">Searching…</div>;
  if (hits.length === 0) return <div>No results</div>;
  return (
    <ul style={{ marginTop: 16 }}>
      {hits.map((h) => (
        <li key={h.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
          <a href={`/course/${h.id}`} style={{ fontWeight: 600 }}>{h.title}</a>
          {h.description ? <div style={{ color: '#666' }}>{h.description}</div> : null}
        </li>
      ))}
    </ul>
  );
}
