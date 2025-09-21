import React from 'react';
import Link from 'next/link';
import {Course} from '../data/courses';

export default function CourseCard({course}: {course: Course}) {
  return (
    <article className="border rounded-lg p-4 mb-3 hover:shadow">
      <h3 className="text-lg font-medium">
        <Link href={`/courses/${course.id}`} className="text-blue-600 hover:underline">{course.title}</Link>
      </h3>
      <div className="text-sm text-gray-600">
        <strong>{course.university}</strong> • {course.code} • {course.level}
      </div>
      <p className="mt-2 text-gray-700">{course.notes}</p>
      <div className="flex gap-4 mt-3 text-sm">
        <a href={course.webpage} target="_blank" rel="noreferrer" className="text-blue-600">Course page</a>
        <a href={course.playlist} target="_blank" rel="noreferrer" className="text-blue-600">Playlist</a>
      </div>
    </article>
  );
}

