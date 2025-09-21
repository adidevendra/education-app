'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
export * from './PlayerShell';
import Hls from 'hls.js';

export type CaptionTrack = { label: string; srclang: string; src: string; default?: boolean };
export type TranscriptItem = { start: number; end: number; text: string };
export type Bookmark = { time: number; note?: string };

export function useABLoop() {
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const toggle = () => setEnabled((v) => !v);
  const clear = () => {
    setA(null);
    setB(null);
    setEnabled(false);
  };
  return { a, b, setA, setB, enabled, toggle, clear };
}

export function useBookmarks(initial: Bookmark[] = []) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initial);
  const add = (bm: Bookmark) => setBookmarks((prev) => [...prev, bm].sort((x, y) => x.time - y.time));
  const remove = (time: number) => setBookmarks((prev) => prev.filter((b) => b.time !== time));
  return { bookmarks, add, remove };
}

export function useNotes(initial: Bookmark[] = []) {
  const [notes, setNotes] = useState<Bookmark[]>(initial);
  const add = (bm: Bookmark) => setNotes((prev) => [...prev, bm].sort((x, y) => x.time - y.time));
  const remove = (time: number) => setNotes((prev) => prev.filter((b) => b.time !== time));
  return { notes, add, remove };
}

export type CoursePlayerProps = {
  src: string; // HLS .m3u8 URL
  poster?: string;
  captions?: CaptionTrack[];
  transcript?: TranscriptItem[];
  initialBookmarks?: Bookmark[];
  initialNotes?: Bookmark[];
  onBookmarkAdd?: (bm: Bookmark) => void;
  onNoteAdd?: (bm: Bookmark) => void;
  className?: string;
};

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  src,
  poster,
  captions = [],
  transcript = [],
  initialBookmarks,
  initialNotes,
  onBookmarkAdd,
  onNoteAdd,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { a, b, setA, setB, enabled, toggle: toggleAB, clear: clearAB } = useABLoop();
  const { bookmarks, add: addBookmark } = useBookmarks(initialBookmarks);
  const { notes, add: addNote } = useNotes(initialNotes);

  // HLS attach
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = src; // fallback
    }
  }, [src]);

  // AB loop enforcement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (!enabled) return;
      if (a != null && b != null) {
        if (video.currentTime < a) video.currentTime = a;
        if (video.currentTime >= b) video.currentTime = a;
      }
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, [a, b, enabled]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === ' ') {
        e.preventDefault();
        v.paused ? v.play() : v.pause();
      } else if (e.key.toLowerCase() === 'a') {
        setA(v.currentTime);
      } else if (e.key.toLowerCase() === 'b') {
        setB(v.currentTime);
      } else if (e.key.toLowerCase() === 'l') {
        toggleAB();
      } else if (e.key === 'ArrowRight') {
        v.currentTime += 5;
      } else if (e.key === 'ArrowLeft') {
        v.currentTime -= 5;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleAB, setA, setB]);

  const onAddBookmark = () => {
    const v = videoRef.current;
    if (!v) return;
    const bm = { time: Math.floor(v.currentTime) };
    addBookmark(bm);
    onBookmarkAdd?.(bm);
  };

  const onAddNote = () => {
    const v = videoRef.current;
    if (!v) return;
    const text = prompt('Note');
    if (text && text.trim()) {
      const note = { time: Math.floor(v.currentTime), note: text.trim() };
      addNote(note);
      onNoteAdd?.(note);
    }
  };

  const captionEls = useMemo(() => {
    return captions.map((c, i) => (
      <track key={i} label={c.label} kind="subtitles" srcLang={c.srclang} src={c.src} default={c.default} />
    ));
  }, [captions]);

  return (
    <div className={className}>
      <div className="relative">
        <video ref={videoRef} poster={poster} controls style={{ width: '100%', maxHeight: 480 }}>
          {captionEls}
        </video>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => videoRef.current?.play()}>Play</button>
          <button onClick={() => videoRef.current?.pause()}>Pause</button>
          <button onClick={() => setA(videoRef.current?.currentTime || 0)}>Set A</button>
          <button onClick={() => setB(videoRef.current?.currentTime || 0)}>Set B</button>
          <button onClick={toggleAB}>{enabled ? 'Disable' : 'Enable'} Loop</button>
          <button onClick={clearAB}>Clear Loop</button>
          <button onClick={onAddBookmark}>Bookmark</button>
          <button onClick={onAddNote}>Note</button>
        </div>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Transcript</h4>
          <ul style={{ maxHeight: 160, overflow: 'auto' }}>
            {transcript.map((t, i) => (
              <li key={i}>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = t.start;
                  }}
                >
                  [{formatTime(t.start)}] {t.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Bookmarks</h4>
          <ul>
            {bookmarks.map((b, i) => (
              <li key={i}>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime = b.time)}>
                  {formatTime(b.time)} {b.note ? `- ${b.note}` : ''}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Notes</h4>
          <ul>
            {notes.map((n, i) => (
              <li key={i}>
                <button onClick={() => videoRef.current && (videoRef.current.currentTime = n.time)}>
                  {formatTime(n.time)} - {n.note}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function formatTime(sec: number) {
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((sec / 60) % 60)
    .toString()
    .padStart(2, '0');
  const h = Math.floor(sec / 3600)
    .toString()
    .padStart(2, '0');
  return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
}

export default CoursePlayer;
