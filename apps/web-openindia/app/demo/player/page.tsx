import React from 'react';
import { DemoPlayerClient } from './DemoPlayerClient';

export default function PlayerDemoPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Player Demo</h1>
      <DemoPlayerClient />
    </div>
  );
}
