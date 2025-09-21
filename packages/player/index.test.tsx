import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { CoursePlayer } from './index';

describe('CoursePlayer', () => {
  it('renders video element', () => {
    const { container } = render(<CoursePlayer src="about:blank" />);
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
  });
});
