import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

export interface RetrievalDoc {
  id: string;
  text: string;
  t0?: number | null;
  t1?: number | null;
}

export interface QaResult {
  answer: string;
  citations: { id: string; startOffset: number; endOffset: number }[];
  rejected?: boolean;
  reason?: string;
}

@Injectable()
export class RagService {
  constructor(private readonly client: MeiliSearch = new MeiliSearch({ host: process.env.MEILI_URL || 'http://127.0.0.1:7700' })) {}

  async retrieve(indexName: string, query: string, k = 5): Promise<RetrievalDoc[]> {
    const index = await this.client.getIndex(indexName);
    const res: any = await index.search(query, { limit: k });
    return (res.hits || []).map((h: any) => ({ id: String(h.id), text: h.text, t0: h.t0, t1: h.t1 }));
  }

  // Placeholder QA: choose longest doc snippet containing all query tokens. If not all covered, reject.
  async answer(indexName: string, query: string): Promise<QaResult> {
    const toks = query.toLowerCase().split(/\s+/).filter(Boolean);
    const docs = await this.retrieve(indexName, query, 8);
    if (!docs.length) return { answer: '', citations: [], rejected: true, reason: 'NO_RESULTS' };
    const coverage: { id: string; startOffset: number; endOffset: number }[] = [];
    let answerParts: string[] = [];
    for (const d of docs) {
      const lower = d.text.toLowerCase();
      let all = true;
      for (const t of toks) {
        if (!lower.includes(t)) {
          all = false;
          break;
        }
      }
      if (all) {
        // naive citation: first occurrence span bounding all tokens
        let first = Infinity;
        let last = -1;
        for (const t of toks) {
          const idx = lower.indexOf(t);
            if (idx !== -1) {
              if (idx < first) first = idx;
              const end = idx + t.length;
              if (end > last) last = end;
            }
        }
        if (isFinite(first) && last >= 0) {
          coverage.push({ id: d.id, startOffset: first, endOffset: last });
          answerParts.push(d.text);
          break; // single supporting doc is enough for placeholder
        }
      }
    }
    const coveredTokens = new Set<string>();
    for (const c of coverage) {
      const doc = docs.find(d => d.id === c.id);
      if (doc) {
        const snippet = doc.text.toLowerCase().slice(c.startOffset, c.endOffset + 1);
        toks.forEach(t => { if (snippet.includes(t)) coveredTokens.add(t); });
      }
    }
    if (coveredTokens.size < toks.length) {
      return { answer: '', citations: coverage, rejected: true, reason: 'INSUFFICIENT_CITATION_COVERAGE' };
    }
    return { answer: answerParts.join(' '), citations: coverage };
  }
}
