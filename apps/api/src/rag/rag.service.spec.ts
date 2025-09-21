import { describe, it, expect } from '@jest/globals';
import { RagService } from './rag.service';

// Mock Meili client minimal behavior
class MockIndex { constructor(private docs: any[]) {} async search(q: string){ return { hits: this.docs }; } }
class MockClient { constructor(private docs: any[]) {} async getIndex(){ return new MockIndex(this.docs); } }

describe('RagService coverage', () => {
  it('rejects answer when tokens not fully cited', async () => {
    const docs = [ { id: 'd1', text: 'single token present' } ];
    const svc = new RagService(new MockClient(docs) as any);
    const res = await svc.answer('ignored', 'single missing');
    expect(res.rejected).toBe(true);
    expect(res.reason).toBe('INSUFFICIENT_CITATION_COVERAGE');
  });
  it('accepts answer when tokens covered', async () => {
    const docs = [ { id: 'd1', text: 'algorithm vector function' } ];
    const svc = new RagService(new MockClient(docs) as any);
    const res = await svc.answer('ignored', 'vector algorithm');
    expect(res.rejected).toBeFalsy();
    expect(res.citations.length).toBeGreaterThan(0);
  });
});
