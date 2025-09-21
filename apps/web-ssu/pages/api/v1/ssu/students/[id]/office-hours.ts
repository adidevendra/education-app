import type { NextApiRequest, NextApiResponse } from 'next';
import studentStore from '../../../../store';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query as { id: string };
  if (req.method !== 'POST') return res.status(405).end();
  const store = studentStore();
  const s = store.ensure(id);
  const body = req.body || {};
  const oh = { id: `oh${s.officeHours.length+1}`, scheduledAt: body.scheduledAt, with: body.with||'Counselor', status: 'scheduled' };
  s.officeHours.unshift(oh);
  res.status(201).json({ id: oh.id });
}
