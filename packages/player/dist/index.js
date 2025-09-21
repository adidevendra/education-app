"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.tsx
var index_exports = {};
__export(index_exports, {
  CoursePlayer: () => CoursePlayer,
  PlayerShell: () => PlayerShell,
  default: () => index_default,
  selectCaptionCue: () => selectCaptionCue,
  useABLoop: () => useABLoop,
  useBookmarks: () => useBookmarks,
  useCaptions: () => useCaptions,
  useNotes: () => useNotes
});
module.exports = __toCommonJS(index_exports);
var import_react2 = require("react");

// PlayerShell.tsx
var import_react = require("react");
var import_hls = __toESM(require("hls.js"));
var import_jsx_runtime = require("react/jsx-runtime");
function selectCaptionCue(cues, time, driftThresholdMs) {
  const direct = cues.find((c) => time >= c.start && time < c.end);
  if (direct) return direct;
  const thresholdSec = driftThresholdMs / 1e3;
  const near = cues.find((c) => Math.abs(time - c.start) <= thresholdSec);
  return near || null;
}
function useCaptions({ cues, videoRef, enabled, driftThreshold }) {
  const [active, setActive] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
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
  const videoRef = (0, import_react.useRef)(null);
  const [lang, setLang] = (0, import_react.useState)(initialLanguage);
  const [showCaptions, setShowCaptions] = (0, import_react.useState)(true);
  const [showGlossary, setShowGlossary] = (0, import_react.useState)(false);
  const src = lang === "en" ? srcEn : srcHi || srcEn;
  (0, import_react.useEffect)(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    if (import_hls.default.isSupported()) {
      const hls = new import_hls.default();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    video.src = src;
  }, [src]);
  const activeCue = useCaptions({ cues: captions, videoRef, enabled: showCaptions, driftThreshold: driftCorrectionMs });
  const glossaryIndex = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    glossary.forEach((g) => map.set(g.term.toLowerCase(), g));
    return map;
  }, [glossary]);
  const highlighted = (0, import_react.useMemo)(() => {
    if (!activeCue) return null;
    const words = activeCue.text.split(/(\s+)/).map((w, i) => {
      const term = glossaryIndex.get(w.toLowerCase());
      if (term) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-term": term.term, className: "player-term", style: { cursor: "pointer", textDecoration: "underline dotted" }, children: w }, i);
      }
      return w;
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: words });
  }, [activeCue, glossaryIndex]);
  (0, import_react.useEffect)(() => {
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
  const onGlossaryClick = (0, import_react.useCallback)((e) => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className, "data-player-shell": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { ref: videoRef, controls: true, style: { width: "100%", maxHeight: 500 } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "absolute", top: 8, left: 8, display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setLang((l) => l === "en" ? "hi" : "en"), "aria-label": "toggle-language", children: [
          "Lang: ",
          lang
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setShowCaptions((c) => !c), "aria-label": "toggle-captions", children: [
          "CC ",
          showCaptions ? "On" : "Off"
        ] }),
        glossary.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setShowGlossary((g) => !g), "aria-label": "toggle-glossary", children: "Glossary" })
      ] }),
      showCaptions && activeCue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { onClick: onGlossaryClick, "aria-live": "polite", style: { position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "white", textShadow: "0 0 4px black", fontSize: 18 }, children: highlighted })
    ] }),
    showGlossary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { "aria-label": "glossary", style: { marginTop: 12, border: "1px solid #ddd", padding: 8, maxHeight: 200, overflow: "auto" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "4px 0" }, children: "Glossary" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: glossary.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { style: { marginBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: g.term }),
        ": ",
        g.definition
      ] }, g.term)) })
    ] })
  ] });
};

// index.tsx
var import_hls2 = __toESM(require("hls.js"));
var import_jsx_runtime2 = require("react/jsx-runtime");
function useABLoop() {
  const [a, setA] = (0, import_react2.useState)(null);
  const [b, setB] = (0, import_react2.useState)(null);
  const [enabled, setEnabled] = (0, import_react2.useState)(false);
  const toggle = () => setEnabled((v) => !v);
  const clear = () => {
    setA(null);
    setB(null);
    setEnabled(false);
  };
  return { a, b, setA, setB, enabled, toggle, clear };
}
function useBookmarks(initial = []) {
  const [bookmarks, setBookmarks] = (0, import_react2.useState)(initial);
  const add = (bm) => setBookmarks((prev) => [...prev, bm].sort((x, y) => x.time - y.time));
  const remove = (time) => setBookmarks((prev) => prev.filter((b) => b.time !== time));
  return { bookmarks, add, remove };
}
function useNotes(initial = []) {
  const [notes, setNotes] = (0, import_react2.useState)(initial);
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
  const videoRef = (0, import_react2.useRef)(null);
  const { a, b, setA, setB, enabled, toggle: toggleAB, clear: clearAB } = useABLoop();
  const { bookmarks, add: addBookmark } = useBookmarks(initialBookmarks);
  const { notes, add: addNote } = useNotes(initialNotes);
  (0, import_react2.useEffect)(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (import_hls2.default.isSupported()) {
      const hls = new import_hls2.default();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);
  (0, import_react2.useEffect)(() => {
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
  (0, import_react2.useEffect)(() => {
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
  const captionEls = (0, import_react2.useMemo)(() => {
    return captions.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("track", { label: c.label, kind: "subtitles", srcLang: c.srclang, src: c.src, default: c.default }, i));
  }, [captions]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("video", { ref: videoRef, poster, controls: true, style: { width: "100%", maxHeight: 480 }, children: captionEls }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => {
          var _a;
          return (_a = videoRef.current) == null ? void 0 : _a.play();
        }, children: "Play" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => {
          var _a;
          return (_a = videoRef.current) == null ? void 0 : _a.pause();
        }, children: "Pause" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => {
          var _a;
          return setA(((_a = videoRef.current) == null ? void 0 : _a.currentTime) || 0);
        }, children: "Set A" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => {
          var _a;
          return setB(((_a = videoRef.current) == null ? void 0 : _a.currentTime) || 0);
        }, children: "Set B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { onClick: toggleAB, children: [
          enabled ? "Disable" : "Enable",
          " Loop"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: clearAB, children: "Clear Loop" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: onAddBookmark, children: "Bookmark" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: onAddNote, children: "Note" })
      ] })
    ] }),
    transcript.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: "Transcript" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { style: { maxHeight: 160, overflow: "auto" }, children: transcript.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
    bookmarks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: "Bookmarks" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { children: bookmarks.map((b2, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = b2.time), children: [
        formatTime(b2.time),
        " ",
        b2.note ? `- ${b2.note}` : ""
      ] }) }, i)) })
    ] }),
    notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginTop: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: "Notes" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { children: notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { onClick: () => videoRef.current && (videoRef.current.currentTime = n.time), children: [
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CoursePlayer,
  PlayerShell,
  selectCaptionCue,
  useABLoop,
  useBookmarks,
  useCaptions,
  useNotes
});
//# sourceMappingURL=index.js.map