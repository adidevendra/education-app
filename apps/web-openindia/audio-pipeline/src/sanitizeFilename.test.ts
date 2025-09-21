import {sanitizeFilename} from './utils';

describe('sanitizeFilename', () => {
  it('replaces spaces and special chars', () => {
    expect(sanitizeFilename('a b/c?d.mp3')).toBe('a_b_c_d.mp3');
  });
});
