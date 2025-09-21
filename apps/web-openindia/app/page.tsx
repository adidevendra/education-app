import React from 'react';

export default function HomePage() {
  return (
    <div>
      <section style={{ padding: '48px 0' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800 }}>Learn from the best, in your language</h1>
        <p style={{ marginTop: 8, color: '#555' }}>Open university courses curated for India.</p>
        <form action="/catalog" method="get" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <input name="q" placeholder="Search courses" style={{ flex: 1, border: '1px solid #ccc', padding: 8 }} />
          <select name="lang" style={{ border: '1px solid #ccc', padding: 8 }}>
            <option value="">Any language</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
          <button type="submit">Search</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
          {['AI/ML', 'Computer Science', 'Mathematics', 'Economics', 'History', 'Music'].map((c) => (
            <a key={c} href={`/catalog?category=${encodeURIComponent(c)}`} style={{ display: 'block', border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
              {c}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
