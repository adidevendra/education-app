import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PlayerShell } from './PlayerShell';

let rafCallbacks: Map<number, FrameRequestCallback>;
let rafId = 0;

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
    configurable: true,
    value: () => 'probably',
  });
});

beforeEach(() => {
  rafCallbacks = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    const id = ++rafId;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
    rafCallbacks.delete(id);
  });
});

afterEach(() => {
  rafCallbacks.clear();
  vi.restoreAllMocks();
});

function flushRaf() {
  const callbacks = Array.from(rafCallbacks.entries());
  rafCallbacks.clear();
  callbacks.forEach(([, cb]) => cb(performance.now()));
}

describe('PlayerShell keyboard shortcuts', () => {
  const captions = [{ start: 0, end: 5, text: 'Shortcut caption' }];
  const glossary = [{ term: 'Shortcut', definition: 'A quick way to do something' }];

  it('handles playback, seeking, captions, and glossary toggles', async () => {
    const playSpy = vi.fn().mockResolvedValue(undefined);
    const pauseSpy = vi.fn();

    const { container } = render(
      <PlayerShell srcEn="/media/en.m3u8" srcHi="/media/hi.m3u8" captions={captions} glossary={glossary} />,
    );

    const video = container.querySelector('video') as HTMLVideoElement;

    let paused = true;
    Object.defineProperty(video, 'paused', {
      configurable: true,
      get: () => paused,
    });

    let currentTime = 1;
    Object.defineProperty(video, 'currentTime', {
      configurable: true,
      get: () => currentTime,
      set: (value) => {
        currentTime = value;
      },
    });

    video.play = playSpy as unknown as typeof video.play;
    video.pause = pauseSpy as unknown as typeof video.pause;

    // Ensure caption loop initialises
    flushRaf();

    // Space toggles play
    await act(async () => {
      fireEvent.keyDown(window, { key: ' ' });
    });
    await Promise.resolve();
    expect(playSpy).toHaveBeenCalledTimes(1);
    paused = false;

    // "k" toggles pause when playing
    await act(async () => {
      fireEvent.keyDown(window, { key: 'k' });
    });
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    paused = true;

    // Seek backward with "j"
    await act(async () => {
      fireEvent.keyDown(window, { key: 'j' });
    });
    expect(currentTime).toBeCloseTo(0, 5);

    // Seek forward with "l"
    await act(async () => {
      fireEvent.keyDown(window, { key: 'l' });
    });
    expect(currentTime).toBeCloseTo(5, 5);

    // Toggle captions off with "c"
    await act(async () => {
      flushRaf();
    });
    const captionsToggle = screen.getByLabelText('toggle-captions');
    expect(captionsToggle.textContent).toContain('On');
    await act(async () => {
      fireEvent.keyDown(window, { key: 'c' });
    });
    expect(captionsToggle.textContent).toContain('Off');

    // Toggle glossary visibility with "g"
    expect(screen.queryByLabelText('glossary')).toBeNull();
    await act(async () => {
      fireEvent.keyDown(window, { key: 'g' });
    });
    expect(screen.getByLabelText('glossary')).toBeInTheDocument();
  });
});
