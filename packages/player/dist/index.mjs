// index.tsx
import React2, { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";

// PlayerShell.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
function selectCaptionCue(cues, time, driftThresholdMs) {
  const direct = cues.find((c) => time >= c.start && time < c.end);
  if (direct) return direct;
  const thresholdSec = driftThresholdMs / 1e3;
  const near = cues.find((c) => Math.abs(time - c.start) <= thresholdSec);
  return near || null;
}
function useCaptions({ cues, video, enabled, driftThreshold }) {
  const [active, setActive] = useState(null);
  useEffect(() => {
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
  }, [video, cues, enabled, driftThreshold]);
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
  const activeCue = useCaptions({ cues: captions, video: videoRef.current, enabled: showCaptions, driftThreshold: driftCorrectionMs });
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
        return /* @__PURE__ */ React.createElement("span", { key: i, "data-term": term.term, className: "player-term", style: { cursor: "pointer", textDecoration: "underline dotted" } }, w);
      }
      return w;
    });
    return /* @__PURE__ */ React.createElement("span", null, words);
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
  return /* @__PURE__ */ React.createElement("div", { className, "data-player-shell": true }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("video", { ref: videoRef, controls: true, style: { width: "100%", maxHeight: 500 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 8, left: 8, display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setLang((l) => l === "en" ? "hi" : "en"), "aria-label": "toggle-language" }, "Lang: ", lang), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowCaptions((c) => !c), "aria-label": "toggle-captions" }, "CC ", showCaptions ? "On" : "Off"), glossary.length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => setShowGlossary((g) => !g), "aria-label": "toggle-glossary" }, "Glossary")), showCaptions && activeCue && /* @__PURE__ */ React.createElement("div", { onClick: onGlossaryClick, "aria-live": "polite", style: { position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "white", textShadow: "0 0 4px black", fontSize: 18 } }, highlighted)), showGlossary && /* @__PURE__ */ React.createElement("aside", { "aria-label": "glossary", style: { marginTop: 12, border: "1px solid #ddd", padding: 8, maxHeight: 200, overflow: "auto" } }, /* @__PURE__ */ React.createElement("h4", { style: { margin: "4px 0" } }, "Glossary"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0 } }, glossary.map((g) => /* @__PURE__ */ React.createElement("li", { key: g.term, style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement("strong", null, g.term), ": ", g.definition)))));
};

// index.tsx
import Hls2 from "hls.js";
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
    onBookmarkAdd == null ? void 0 : onBookmarkAdd(bm);
  };
  const onAddNote = () => {
    const v = videoRef.current;
    if (!v) return;
    const text = prompt("Note");
    if (text && text.trim()) {
      const note = { time: Math.floor(v.currentTime), note: text.trim() };
      addNote(note);
      onNoteAdd == null ? void 0 : onNoteAdd(note);
    }
  };
  const captionEls = useMemo2(() => {
    return captions.map((c, i) => /* @__PURE__ */ React2.createElement("track", { key: i, label: c.label, kind: "subtitles", srcLang: c.srclang, src: c.src, default: c.default }));
  }, [captions]);
  return /* @__PURE__ */ React2.createElement("div", { className }, /* @__PURE__ */ React2.createElement("div", { className: "relative" }, /* @__PURE__ */ React2.createElement("video", { ref: videoRef, poster, controls: true, style: { width: "100%", maxHeight: 480 } }, captionEls), /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React2.createElement("button", { onClick: () => {
    var _a;
    return (_a = videoRef.current) == null ? void 0 : _a.play();
  } }, "Play"), /* @__PURE__ */ React2.createElement("button", { onClick: () => {
    var _a;
    return (_a = videoRef.current) == null ? void 0 : _a.pause();
  } }, "Pause"), /* @__PURE__ */ React2.createElement("button", { onClick: () => {
    var _a;
    return setA(((_a = videoRef.current) == null ? void 0 : _a.currentTime) || 0);
  } }, "Set A"), /* @__PURE__ */ React2.createElement("button", { onClick: () => {
    var _a;
    return setB(((_a = videoRef.current) == null ? void 0 : _a.currentTime) || 0);
  } }, "Set B"), /* @__PURE__ */ React2.createElement("button", { onClick: toggleAB }, enabled ? "Disable" : "Enable", " Loop"), /* @__PURE__ */ React2.createElement("button", { onClick: clearAB }, "Clear Loop"), /* @__PURE__ */ React2.createElement("button", { onClick: onAddBookmark }, "Bookmark"), /* @__PURE__ */ React2.createElement("button", { onClick: onAddNote }, "Note"))), transcript.length > 0 && /* @__PURE__ */ React2.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React2.createElement("h4", null, "Transcript"), /* @__PURE__ */ React2.createElement("ul", { style: { maxHeight: 160, overflow: "auto" } }, transcript.map((t, i) => /* @__PURE__ */ React2.createElement("li", { key: i }, /* @__PURE__ */ React2.createElement(
    "button",
    {
      onClick: () => {
        if (videoRef.current) videoRef.current.currentTime = t.start;
      }
    },
    "[",
    formatTime(t.start),
    "] ",
    t.text
  ))))), bookmarks.length > 0 && /* @__PURE__ */ React2.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React2.createElement("h4", null, "Bookmarks"), /* @__PURE__ */ React2.createElement("ul", null, bookmarks.map((b2, i) => /* @__PURE__ */ React2.createElement("li", { key: i }, /* @__PURE__ */ React2.createElement("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = b2.time) }, formatTime(b2.time), " ", b2.note ? `- ${b2.note}` : ""))))), notes.length > 0 && /* @__PURE__ */ React2.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React2.createElement("h4", null, "Notes"), /* @__PURE__ */ React2.createElement("ul", null, notes.map((n, i) => /* @__PURE__ */ React2.createElement("li", { key: i }, /* @__PURE__ */ React2.createElement("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = n.time) }, formatTime(n.time), " - ", n.note))))));
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