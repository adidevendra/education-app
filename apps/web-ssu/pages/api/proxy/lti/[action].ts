import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { action } = req.query;
  const url = `${API_BASE}/lti/${action}`;
  const init: RequestInit = { method: req.method, headers: { 'Content-Type': 'application/json' } } as any;
  if(req.method !== 'GET'){
    init.body = JSON.stringify(req.body || {});
  }
  const r = await fetch(url, init as any);
  const data = await r.json().catch(()=>({ error: 'invalid json'}));
  res.status(r.status).json(data);
}
