import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { CoursePlayer } from '..';

const meta: Meta<typeof CoursePlayer> = {
  title: 'Player/CoursePlayer',
  component: CoursePlayer,
};
export default meta;

type Story = StoryObj<typeof CoursePlayer>;

export const Basic: Story = {
  args: {
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    transcript: [
      { start: 0, end: 3, text: 'Intro' },
      { start: 3, end: 8, text: 'Topic' },
    ],
  },
};
