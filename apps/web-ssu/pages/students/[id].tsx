import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { createTicket, getStudent, scheduleOfficeHour, StudentDetail } from '@repo/sdk';

export default function StudentDetailPage(){
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [data, setData] = useState<StudentDetail|null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [withWho, setWithWho] = useState('Counselor');

  useEffect(()=>{
    if (!id) return;
    setLoading(true);
    getStudent(id).then(setData).finally(()=>setLoading(false));
  }, [id]);

  async function onCreateTicket(){
    if (!id || !title) return;
    await createTicket(id, { title, body });
    // refresh
    const next = await getStudent(id);
    setData(next);
    setTitle(''); setBody('');
  }
  async function onSchedule(){
    if (!id || !scheduledAt) return;
    await scheduleOfficeHour(id, { scheduledAt, with: withWho });
    const next = await getStudent(id);
    setData(next);
    setScheduledAt('');
  }

  return (
    <Layout>
      {loading || !data ? <div>Loading…</div> : (
        <div className="grid cols-2">
          <section>
            <h2 className="page-title">{data.name} <span className="muted">({data.email})</span></h2>
            <div className="card">
              <div className="stack"><strong>Risk</strong><span>{data.riskScore}</span></div>
              <div className="stack"><strong>Velocity</strong><span>{data.progressVelocity}%/wk</span></div>
            </div>
            <h3>Timeline</h3>
            <div className="card">
              <ul>
                {data.enrollments.map((e: { courseId: string; course: string; startedAt: string; progressPct: number })=> (
                  <li key={e.courseId}>
                    Enrolled in {e.course} on {new Date(e.startedAt).toLocaleDateString()} – {e.progressPct}%
                  </li>
                ))}
                {data.tickets.map((t: { id: string; title: string; status: string; createdAt: string })=> (
                  <li key={t.id}>Ticket: {t.title} – {t.status} ({new Date(t.createdAt).toLocaleString()})</li>
                ))}
                {data.notes.map((n: { id: string; body: string; createdAt: string; author: string })=> (
                  <li key={n.id}>Note by {n.author}: {n.body} ({new Date(n.createdAt).toLocaleString()})</li>
                ))}
                {data.officeHours.map((o: { id: string; scheduledAt: string; with: string; status: string })=> (
                  <li key={o.id}>Office hour with {o.with} on {new Date(o.scheduledAt).toLocaleString()} – {o.status}</li>
                ))}
              </ul>
            </div>
          </section>
          <aside className="grid">
            <div className="card">
              <h3>Create ticket</h3>
              <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <textarea className="input" placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
              <button className="btn primary" onClick={onCreateTicket}>Create</button>
            </div>
            <div className="card">
              <h3>Schedule office hour</h3>
              <input className="input" type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} />
              <input className="input" placeholder="With" value={withWho} onChange={e=>setWithWho(e.target.value)} />
              <button className="btn" onClick={onSchedule}>Schedule</button>
            </div>
          </aside>
        </div>
      )}
    </Layout>
  );
}
