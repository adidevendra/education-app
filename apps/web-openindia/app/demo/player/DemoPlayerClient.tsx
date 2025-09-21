'use client';

import React from 'react';
import { PlayerShell } from '@education/player';

const captions = [
  { start: 0, end: 3, text: 'Namaste and welcome to Open India' },
  { start: 3, end: 7, text: 'This platform supports bilingual learning' },
];

const glossary = [
  { term: 'Namaste', definition: 'A traditional Indian greeting' },
  { term: 'bilingual', definition: 'Involving two languages' },
];

export function DemoPlayerClient() {
  return (
    <PlayerShell
      srcEn="/sample/en.m3u8"
      srcHi="/sample/hi.m3u8"
      captions={captions}
      glossary={glossary}
    />
  );
}
