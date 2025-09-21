import type { NextApiRequest, NextApiResponse } from 'next';
import studentStore from '../../../../store';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query as { id: string };
  if (req.method !== 'POST') return res.status(405).end();
  const store = studentStore();
  const s = store.ensure(id);
  const body = req.body || {};
  const t = { id: `t${s.tickets.length+1}`, title: body.title || 'Ticket', status: 'open', createdAt: new Date().toISOString() };
  s.tickets.unshift(t);
  res.status(201).json({ id: t.id });
}
