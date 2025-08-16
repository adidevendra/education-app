import { describe, it, expect } from '@jest/globals';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string() });
  const pipe = new ZodValidationPipe(schema);

  it('returns value when valid', () => {
    const out = pipe.transform({ name: 'ok' } as any, { type: 'body' } as any);
    expect(out).toEqual({ name: 'ok' });
  });

  it('throws BadRequestException when invalid', () => {
    expect(() => pipe.transform({ name: 1 } as any, { type: 'body' } as any)).toThrow(BadRequestException);
  });
});
