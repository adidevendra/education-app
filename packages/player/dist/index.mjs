"use client";

// index.tsx
import { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";

// PlayerShell.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { jsx, jsxs } from "react/jsx-runtime";
function selectCaptionCue(cues, time, driftThresholdMs) {
  const direct = cues.find((c) => time >= c.start && time < c.end);
  if (direct) return direct;
  const thresholdSec = driftThresholdMs / 1e3;
  const near = cues.find((c) => Math.abs(time - c.start) <= thresholdSec);
  return near || null;
}
function useCaptions({ cues, videoRef, enabled, driftThreshold }) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) {
      setActive(null);
      return;
    }
    let raf;
    const loop = () => {
      const cue = selectCaptionCue(cues, video.currentTime, driftThreshold);
      setActive((prev) => prev === cue ? prev : cue);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [videoRef, cues, enabled, driftThreshold]);
  return active;
}
var PlayerShell = ({
  srcEn,
  srcHi,
  captions = [],
  glossary = [],
  initialLanguage = "en",
  driftCorrectionMs = 120,
  className
}) => {
  const videoRef = useRef(null);
  const [lang, setLang] = useState(initialLanguage);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const src = lang === "en" ? srcEn : srcHi || srcEn;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
    const map = /* @__PURE__ */ new Map();
    glossary.forEach((g) => map.set(g.term.toLowerCase(), g));
    return map;
  }, [glossary]);
  const highlighted = useMemo(() => {
    if (!activeCue) return null;
    const words = activeCue.text.split(/(\s+)/).map((w, i) => {
      const term = glossaryIndex.get(w.toLowerCase());
      if (term) {
        return /* @__PURE__ */ jsx("span", { "data-term": term.term, className: "player-term", style: { cursor: "pointer", textDecoration: "underline dotted" }, children: w }, i);
      }
      return w;
    });
    return /* @__PURE__ */ jsx("span", { children: words });
  }, [activeCue, glossaryIndex]);
  useEffect(() => {
    const handler = (e) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === " ") {
        e.preventDefault();
        v.paused ? v.play() : v.pause();
      } else if (e.key.toLowerCase() === "j") {
        v.currentTime = Math.max(0, v.currentTime - 5);
      } else if (e.key.toLowerCase() === "k") {
        v.paused ? v.play() : v.pause();
      } else if (e.key.toLowerCase() === "l") {
        v.currentTime = v.currentTime + 5;
      } else if (e.key.toLowerCase() === "c") {
        setShowCaptions((s) => !s);
      } else if (e.key.toLowerCase() === "g") {
        setShowGlossary((g) => !g);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const onGlossaryClick = useCallback((e) => {
    const el = e.target.closest("[data-term]");
    if (el) {
      const term = el.getAttribute("data-term");
      if (term) {
        setShowGlossary(true);
        const entry = glossaryIndex.get(term.toLowerCase());
        if (entry) {
        }
      }
    }
  }, [glossaryIndex]);
  return /* @__PURE__ */ jsxs("div", { className, "data-player-shell": true, children: [
    /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsx("video", { ref: videoRef, controls: true, style: { width: "100%", maxHeight: 500 } }),
      /* @__PURE__ */ jsxs("div", { style: { position: "absolute", top: 8, left: 8, display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setLang((l) => l === "en" ? "hi" : "en"), "aria-label": "toggle-language", children: [
          "Lang: ",
          lang
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowCaptions((c) => !c), "aria-label": "toggle-captions", children: [
          "CC ",
          showCaptions ? "On" : "Off"
        ] }),
        glossary.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => setShowGlossary((g) => !g), "aria-label": "toggle-glossary", children: "Glossary" })
      ] }),
      showCaptions && activeCue && /* @__PURE__ */ jsx("div", { onClick: onGlossaryClick, "aria-live": "polite", style: { position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "white", textShadow: "0 0 4px black", fontSize: 18 }, children: highlighted })
    ] }),
    showGlossary && /* @__PURE__ */ jsxs("aside", { "aria-label": "glossary", style: { marginTop: 12, border: "1px solid #ddd", padding: 8, maxHeight: 200, overflow: "auto" }, children: [
      /* @__PURE__ */ jsx("h4", { style: { margin: "4px 0" }, children: "Glossary" }),
      /* @__PURE__ */ jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: glossary.map((g) => /* @__PURE__ */ jsxs("li", { style: { marginBottom: 4 }, children: [
        /* @__PURE__ */ jsx("strong", { children: g.term }),
        ": ",
        g.definition
      ] }, g.term)) })
    ] })
  ] });
};

// index.tsx
import Hls2 from "hls.js";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function useABLoop() {
  const [a, setA] = useState2(null);
  const [b, setB] = useState2(null);
  const [enabled, setEnabled] = useState2(false);
  const toggle = () => setEnabled((v) => !v);
  const clear = () => {
    setA(null);
    setB(null);
    setEnabled(false);
  };
  return { a, b, setA, setB, enabled, toggle, clear };
}
function useBookmarks(initial = []) {
  const [bookmarks, setBookmarks] = useState2(initial);
  const add = (bm) => setBookmarks((prev) => [...prev, bm].sort((x, y) => x.time - y.time));
  const remove = (time) => setBookmarks((prev) => prev.filter((b) => b.time !== time));
  return { bookmarks, add, remove };
}
function useNotes(initial = []) {
  const [notes, setNotes] = useState2(initial);
  const add = (bm) => setNotes((prev) => [...prev, bm].sort((x, y) => x.time - y.time));
  const remove = (time) => setNotes((prev) => prev.filter((b) => b.time !== time));
  return { notes, add, remove };
}
var CoursePlayer = ({
  src,
  poster,
  captions = [],
  transcript = [],
  initialBookmarks,
  initialNotes,
  onBookmarkAdd,
  onNoteAdd,
  className
}) => {
  const videoRef = useRef2(null);
  const { a, b, setA, setB, enabled, toggle: toggleAB, clear: clearAB } = useABLoop();
  const { bookmarks, add: addBookmark } = useBookmarks(initialBookmarks);
  const { notes, add: addNote } = useNotes(initialNotes);
  useEffect2(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls2.isSupported()) {
      const hls = new Hls2();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);
  useEffect2(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (!enabled) return;
      if (a != null && b != null) {
        if (video.currentTime < a) video.currentTime = a;
        if (video.currentTime >= b) video.currentTime = a;
      }
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [a, b, enabled]);
  useEffect2(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === " ") {
        e.preventDefault();
        v.paused ? v.play() : v.pause();
      } else if (e.key.toLowerCase() === "a") {
        setA(v.currentTime);
      } else if (e.key.toLowerCase() === "b") {
        setB(v.currentTime);
      } else if (e.key.toLowerCase() === "l") {
        toggleAB();
      } else if (e.key === "ArrowRight") {
        v.currentTime += 5;
      } else if (e.key === "ArrowLeft") {
        v.currentTime -= 5;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
    const text = prompt("Note");
    if (text && text.trim()) {
      const note = { time: Math.floor(v.currentTime), note: text.trim() };
      addNote(note);
      onNoteAdd?.(note);
    }
  };
  const captionEls = useMemo2(() => {
    return captions.map((c, i) => /* @__PURE__ */ jsx2("track", { label: c.label, kind: "subtitles", srcLang: c.srclang, src: c.src, default: c.default }, i));
  }, [captions]);
  return /* @__PURE__ */ jsxs2("div", { className, children: [
    /* @__PURE__ */ jsxs2("div", { className: "relative", children: [
      /* @__PURE__ */ jsx2("video", { ref: videoRef, poster, controls: true, style: { width: "100%", maxHeight: 480 }, children: captionEls }),
      /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
        /* @__PURE__ */ jsx2("button", { onClick: () => videoRef.current?.play(), children: "Play" }),
        /* @__PURE__ */ jsx2("button", { onClick: () => videoRef.current?.pause(), children: "Pause" }),
        /* @__PURE__ */ jsx2("button", { onClick: () => setA(videoRef.current?.currentTime || 0), children: "Set A" }),
        /* @__PURE__ */ jsx2("button", { onClick: () => setB(videoRef.current?.currentTime || 0), children: "Set B" }),
        /* @__PURE__ */ jsxs2("button", { onClick: toggleAB, children: [
          enabled ? "Disable" : "Enable",
          " Loop"
        ] }),
        /* @__PURE__ */ jsx2("button", { onClick: clearAB, children: "Clear Loop" }),
        /* @__PURE__ */ jsx2("button", { onClick: onAddBookmark, children: "Bookmark" }),
        /* @__PURE__ */ jsx2("button", { onClick: onAddNote, children: "Note" })
      ] })
    ] }),
    transcript.length > 0 && /* @__PURE__ */ jsxs2("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ jsx2("h4", { children: "Transcript" }),
      /* @__PURE__ */ jsx2("ul", { style: { maxHeight: 160, overflow: "auto" }, children: transcript.map((t, i) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2(
        "button",
        {
          onClick: () => {
            if (videoRef.current) videoRef.current.currentTime = t.start;
          },
          children: [
            "[",
            formatTime(t.start),
            "] ",
            t.text
          ]
        }
      ) }, i)) })
    ] }),
    bookmarks.length > 0 && /* @__PURE__ */ jsxs2("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ jsx2("h4", { children: "Bookmarks" }),
      /* @__PURE__ */ jsx2("ul", { children: bookmarks.map((b2, i) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = b2.time), children: [
        formatTime(b2.time),
        " ",
        b2.note ? `- ${b2.note}` : ""
      ] }) }, i)) })
    ] }),
    notes.length > 0 && /* @__PURE__ */ jsxs2("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ jsx2("h4", { children: "Notes" }),
      /* @__PURE__ */ jsx2("ul", { children: notes.map((n, i) => /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = n.time), children: [
        formatTime(n.time),
        " - ",
        n.note
      ] }) }, i)) })
    ] })
  ] });
};
function formatTime(sec) {
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60 % 60).toString().padStart(2, "0");
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  return h !== "00" ? `${h}:${m}:${s}` : `${m}:${s}`;
}
var index_default = CoursePlayer;
export {
  CoursePlayer,
  PlayerShell,
  index_default as default,
  selectCaptionCue,
  useABLoop,
  useBookmarks,
  useCaptions,
  useNotes
};
//# sourceMappingURL=index.mjs.map