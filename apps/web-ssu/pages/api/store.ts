type Student = any;
const _store: Record<string, Student> = {};

export default function studentStore(){
  return {
    ensure(id: string){
      if (!_store[id]) {
        _store[id] = {
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
      return _store[id];
    }
  };
}
