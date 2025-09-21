import { useEffect, useState } from 'react';

export default function LtiLaunchPage(){
  const [status, setStatus] = useState<'idle'|'launched'|'graded'|'error'>('idle');
  const [ctx, setCtx] = useState<any>(null);

  useEffect(()=>{
    // In real launch, platform POSTs with state, nonce, id_token. Here we mock by fetching login then posting launch.
    async function run(){
      try {
        const login = await fetch('/api/proxy/lti/login').then(r=>r.json());
        const launch = await fetch('/api/proxy/lti/launch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ state: login.state, nonce: login.nonce, id_token: 'stub' }) }).then(r=>r.json());
        if(!launch.ok){ setStatus('error'); return; }
        setCtx(launch.context);
        setStatus('launched');
      } catch(e){ setStatus('error'); }
    }
    run();
  },[]);

  async function submitGrade(){
    await fetch('/api/proxy/lti/grade', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lineItem: 'lineitem-1', userId: ctx?.user || 'learner1', score: 0.92 })});
    setStatus('graded');
  }

  return <div style={{padding:20}}>
    <h1>LTI Launch Demo</h1>
    <p>Status: {status}</p>
    {status==='launched' && <>
      <pre>{JSON.stringify(ctx,null,2)}</pre>
      <button onClick={submitGrade}>Submit Quiz Grade</button>
    </>}
    {status==='graded' && <p>Grade submitted.</p>}
  </div>;
}
