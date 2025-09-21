import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';

export type GlossaryEntry = { term: string; definition: string; };
export type CaptionCue = { start: number; end: number; text: string };

export interface PlayerShellProps {
  srcEn: string; // English HLS/DASH URL
  srcHi?: string; // Hindi alternative
  captions?: CaptionCue[]; // Provided in base (English) timeline
  glossary?: GlossaryEntry[];
  initialLanguage?: 'en' | 'hi';
  className?: string;
  driftCorrectionMs?: number; // threshold to snap drift
}

export function selectCaptionCue(cues: CaptionCue[], time: number, driftThresholdMs: number): CaptionCue | null {
  // exact match first
  const direct = cues.find(c => time >= c.start && time < c.end);
  if (direct) return direct;
  // drift: near start within threshold
  const thresholdSec = driftThresholdMs / 1000;
  const near = cues.find(c => Math.abs(time - c.start) <= thresholdSec);
  return near || null;
}

interface UseCaptionsArgs {
  cues: CaptionCue[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  driftThreshold: number;
}

export function useCaptions({ cues, videoRef, enabled, driftThreshold }: UseCaptionsArgs) {
  const [active, setActive] = useState<CaptionCue | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) { setActive(null); return; }
    let raf: number;
    const loop = () => {
      const cue = selectCaptionCue(cues, video.currentTime, driftThreshold);
      setActive(prev => prev === cue ? prev : cue);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [videoRef, cues, enabled, driftThreshold]);
  return active;
}

export const PlayerShell: React.FC<PlayerShellProps> = ({
  srcEn,
  srcHi,
  captions = [],
  glossary = [],
  initialLanguage = 'en',
  driftCorrectionMs = 120,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lang, setLang] = useState<'en' | 'hi'>(initialLanguage);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const src = lang === 'en' ? srcEn : (srcHi || srcEn);

  // attach media (HLS.js if needed)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    video.src = src;
  }, [src]);

  const activeCue = useCaptions({ cues: captions, videoRef, enabled: showCaptions, driftThreshold: driftCorrectionMs });

  const glossaryIndex = useMemo(() => {
    const map = new Map<string, GlossaryEntry>();
    glossary.forEach(g => map.set(g.term.toLowerCase(), g));
    return map;
  }, [glossary]);

  const highlighted = useMemo(() => {
    if (!activeCue) return null;
    const words = activeCue.text.split(/(\s+)/).map((w, i) => {
      const term = glossaryIndex.get(w.toLowerCase());
      if (term) {
        return <span key={i} data-term={term.term} className="player-term" style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}>{w}</span>;
      }
      return w;
    });
    return <span>{words}</span>;
  }, [activeCue, glossaryIndex]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current; if (!v) return;
      if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      else if (e.key.toLowerCase() === 'j') { v.currentTime = Math.max(0, v.currentTime - 5); }
      else if (e.key.toLowerCase() === 'k') { v.paused ? v.play() : v.pause(); }
      else if (e.key.toLowerCase() === 'l') { v.currentTime = v.currentTime + 5; }
      else if (e.key.toLowerCase() === 'c') { setShowCaptions(s => !s); }
      else if (e.key.toLowerCase() === 'g') { setShowGlossary(g => !g); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onGlossaryClick = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('[data-term]');
    if (el) {
      const term = el.getAttribute('data-term');
      if (term) {
        setShowGlossary(true);
        const entry = glossaryIndex.get(term.toLowerCase());
        if (entry) {
          // simple highlight scroll could be added
        }
      }
    }
  }, [glossaryIndex]);

  return (
    <div className={className} data-player-shell>
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} controls style={{ width: '100%', maxHeight: 500 }} />
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 8 }}>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} aria-label="toggle-language">Lang: {lang}</button>
          <button onClick={() => setShowCaptions(c => !c)} aria-label="toggle-captions">CC {showCaptions ? 'On' : 'Off'}</button>
          {glossary.length > 0 && (
            <button onClick={() => setShowGlossary(g => !g)} aria-label="toggle-glossary">Glossary</button>
          )}
        </div>
        {showCaptions && activeCue && (
          <div onClick={onGlossaryClick} aria-live="polite" style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: 'white', textShadow: '0 0 4px black', fontSize: 18 }}>
            {highlighted}
          </div>
        )}
      </div>
      {showGlossary && (
        <aside aria-label="glossary" style={{ marginTop: 12, border: '1px solid #ddd', padding: 8, maxHeight: 200, overflow: 'auto' }}>
          <h4 style={{ margin: '4px 0' }}>Glossary</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {glossary.map(g => (
              <li key={g.term} style={{ marginBottom: 4 }}>
                <strong>{g.term}</strong>: {g.definition}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
};

export default PlayerShell;
