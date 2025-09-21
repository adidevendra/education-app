import React from 'react';
import { courses } from '../../../data/courses';
import { CoursePlayer } from '@education/player';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return courses.slice(0, 50).map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = courses.find((c) => c.id === params.id);
  const title = course ? `${course.title} – ${course.university}` : 'Course';
  const description = course?.notes || 'Open course';
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    alternates: { canonical: `/course/${params.id}` },
  };
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = courses.find((c) => c.id === params.id);
  if (!course) return <div>Not found</div>;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>{course.title}</h1>
      <p style={{ color: '#666' }}>{course.university} • {course.level}</p>
      <div style={{ marginTop: 16 }}>
        <CoursePlayer src={course.playlist.replace('playlist?list=', 'master.m3u8?list=')} />
      </div>
      <section style={{ marginTop: 24 }}>
        <h3>Outcomes</h3>
        <ul>
          <li>Understand key concepts</li>
          <li>Practice with exercises</li>
          <li>Apply learning to projects</li>
        </ul>
      </section>
      <section style={{ marginTop: 24 }}>
        <h3>Instructor</h3>
        <div>{course.faculty}</div>
      </section>
    </div>
  );
}
