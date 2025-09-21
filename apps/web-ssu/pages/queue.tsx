import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { getRiskQueue, RiskStudent } from '@repo/sdk';

export default function QueuePage() {
  const [items, setItems] = useState<RiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [min, setMin] = useState(60);
  const [max, setMax] = useState(100);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(()=>{
    setLoading(true);
    getRiskQueue({ q, min, max }).then(setItems).finally(()=>setLoading(false));
  },[q, min, max]);

  const allSelected = useMemo(()=> items.length>0 && items.every(i=>selected[i.id]), [items, selected]);
  const toggleAll = ()=>{
    const map: Record<string, boolean> = {};
    const next = !allSelected;
    items.forEach(i=> map[i.id]=next);
    setSelected(map);
  };
  const bulk = (action: 'email'|'ticket')=>{
    const ids = items.filter(i=>selected[i.id]).map(i=>i.id);
    // placeholder bulk action
    alert(`${action} for ${ids.length} students`);
  };

  return (
    <Layout>
      <h2 className="page-title">Queue</h2>
      <div className="toolbar" role="toolbar" aria-label="Queue filters and actions">
        <input className="input" aria-label="Search" placeholder="Search name or email" value={q} onChange={e=>setQ(e.target.value)} />
        <span className="stack">
          Risk:
          <input className="input" type="number" value={min} min={0} max={100} onChange={e=>setMin(Number(e.target.value))} />
          –
          <input className="input" type="number" value={max} min={0} max={100} onChange={e=>setMax(Number(e.target.value))} />
        </span>
  <button className="btn" onClick={()=>bulk('email')} aria-label="Email selected students">Email selected</button>
  <button className="btn" onClick={()=>bulk('ticket')} aria-label="Create ticket for selected">Create ticket</button>
      </div>
      {loading? <div>Loading…</div> : (
  <table className="table" role="table" aria-label="At-risk students">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th>Student</th>
              <th>Email</th>
              <th>Course</th>
              <th>Risk</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(s=> (
              <tr key={s.id}>
                <td><input type="checkbox" checked={!!selected[s.id]} onChange={e=> setSelected(prev=> ({...prev, [s.id]: e.target.checked}))} /></td>
                <td>{s.name}</td>
                <td className="muted">{s.email}</td>
                <td>{s.course||'-'}</td>
                <td><strong>{s.riskScore}</strong></td>
                <td><a href={`/students/${s.id}`}>Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
