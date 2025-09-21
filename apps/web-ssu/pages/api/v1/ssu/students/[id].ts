import type { NextApiRequest, NextApiResponse } from 'next';

const store: Record<string, any> = {};

function ensure(id: string){
  if (!store[id]) {
    store[id] = {
      id,
      name: `Student ${id.toUpperCase()}`,
      email: `${id}@example.com`,
      riskScore: 72,
      enrollments: [
        { courseId: 'c1', course: 'Math 101', startedAt: new Date(Date.now()-864e5*30).toISOString(), progressPct: 45 },
      ],
      progressVelocity: 8,
      tickets: [],
      notes: [{ id: 'n1', body: 'Reached out via email', createdAt: new Date().toISOString(), author: 'Advisor' }],
      officeHours: [],
    };
  }
  return store[id];
}

export default function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query as { id: string };
  const student = ensure(id);
  if (req.method === 'GET') {
    return res.status(200).json(student);
  }
  if (req.method === 'POST') {
    const { action } = req.query as { action?: string };
    if (action === 'ticket') {
      const body = req.body || {};
      const t = { id: `t${student.tickets.length+1}`, title: body.title, status: 'open', createdAt: new Date().toISOString() };
      student.tickets.unshift(t);
      return res.status(201).json({ id: t.id });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
