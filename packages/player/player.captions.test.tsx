import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { PlayerShell } from './PlayerShell';

// Provide a deterministic requestAnimationFrame implementation for tests
let rafCallbacks: Map<number, FrameRequestCallback>;
let rafId = 0;

beforeAll(() => {
  rafCallbacks = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    const id = ++rafId;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
    rafCallbacks.delete(id);
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
    configurable: true,
    value: () => 'probably',
  });
});

afterEach(() => {
  rafCallbacks.clear();
  vi.clearAllMocks();
});

function flushRaf() {
  const callbacks = Array.from(rafCallbacks.entries());
  rafCallbacks.clear();
  callbacks.forEach(([, cb]) => cb(performance.now()));
}

describe('PlayerShell captions drift handling', () => {
  it('shows the closest cue when currentTime drifts within ±100ms', async () => {
    const captions = [
      { start: 0, end: 1.8, text: 'First caption' },
      { start: 2, end: 4, text: 'Second caption' },
    ];

    const { container } = render(
      <PlayerShell srcEn="/video/en.m3u8" captions={captions} driftCorrectionMs={100} />,
    );

    const video = container.querySelector('video') as HTMLVideoElement;
    let currentTime = 0;
    Object.defineProperty(video, 'currentTime', {
      configurable: true,
      get: () => currentTime,
      set: (value) => {
        currentTime = value;
      },
    });

    // Drift 50ms before the second cue should still snap to it
    currentTime = 1.95; // 50ms before start of second cue (2.0)
    await act(async () => {
      flushRaf();
    });

    expect(await screen.findByText('Second caption')).toBeInTheDocument();

    // Move beyond the drift window (more than 100ms away) so the cue clears
    currentTime = 4.2;
    await act(async () => {
      flushRaf();
    });

    expect(screen.queryByText('Second caption')).toBeNull();
  });
});
