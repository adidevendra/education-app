import React from 'react';

type GlossaryEntry = {
    term: string;
    definition: string;
};
type CaptionCue = {
    start: number;
    end: number;
    text: string;
};
interface PlayerShellProps {
    srcEn: string;
    srcHi?: string;
    captions?: CaptionCue[];
    glossary?: GlossaryEntry[];
    initialLanguage?: 'en' | 'hi';
    className?: string;
    driftCorrectionMs?: number;
}
declare function selectCaptionCue(cues: CaptionCue[], time: number, driftThresholdMs: number): CaptionCue | null;
interface UseCaptionsArgs {
    cues: CaptionCue[];
    videoRef: React.RefObject<HTMLVideoElement | null>;
    enabled: boolean;
    driftThreshold: number;
}
declare function useCaptions({ cues, videoRef, enabled, driftThreshold }: UseCaptionsArgs): CaptionCue | null;
declare const PlayerShell: React.FC<PlayerShellProps>;

type CaptionTrack = {
    label: string;
    srclang: string;
    src: string;
    default?: boolean;
};
type TranscriptItem = {
    start: number;
    end: number;
    text: string;
};
type Bookmark = {
    time: number;
    note?: string;
};
declare function useABLoop(): {
    a: number | null;
    b: number | null;
    setA: React.Dispatch<React.SetStateAction<number | null>>;
    setB: React.Dispatch<React.SetStateAction<number | null>>;
    enabled: boolean;
    toggle: () => void;
    clear: () => void;
};
declare function useBookmarks(initial?: Bookmark[]): {
    bookmarks: Bookmark[];
    add: (bm: Bookmark) => void;
    remove: (time: number) => void;
};
declare function useNotes(initial?: Bookmark[]): {
    notes: Bookmark[];
    add: (bm: Bookmark) => void;
    remove: (time: number) => void;
};
type CoursePlayerProps = {
    src: string;
    poster?: string;
    captions?: CaptionTrack[];
    transcript?: TranscriptItem[];
    initialBookmarks?: Bookmark[];
    initialNotes?: Bookmark[];
    onBookmarkAdd?: (bm: Bookmark) => void;
    onNoteAdd?: (bm: Bookmark) => void;
    className?: string;
};
declare const CoursePlayer: React.FC<CoursePlayerProps>;

export { type Bookmark, type CaptionCue, type CaptionTrack, CoursePlayer, type CoursePlayerProps, type GlossaryEntry, PlayerShell, type PlayerShellProps, type TranscriptItem, CoursePlayer as default, selectCaptionCue, useABLoop, useBookmarks, useCaptions, useNotes };
