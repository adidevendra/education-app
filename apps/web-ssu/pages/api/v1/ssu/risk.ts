import type { NextApiRequest, NextApiResponse } from 'next';

const mock = Array.from({ length: 12 }).map((_, i) => ({
  id: `s${i+1}`,
  name: `Student ${i+1}`,
  email: `student${i+1}@example.com`,
  course: i%2? 'Math 101':'CS 201',
  riskScore: 100 - i*7,
}));

export default function handler(req: NextApiRequest, res: NextApiResponse){
  const { q, min='0', max='100' } = req.query as Record<string,string>;
  const minN = Number(min), maxN = Number(max);
  let data = mock.filter(s=> s.riskScore>=minN && s.riskScore<=maxN);
  if (q) {
    const qq = q.toLowerCase();
    data = data.filter(s=> s.name.toLowerCase().includes(qq) || s.email.toLowerCase().includes(qq));
  }
  res.status(200).json(data);
}
