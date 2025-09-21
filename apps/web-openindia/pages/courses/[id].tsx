import React from 'react';
import Layout from '../../components/Layout';
import {courses} from '../../data/courses';
import {useRouter} from 'next/router';

export default function CourseDetail() {
  const router = useRouter();
  const {id} = router.query as {id?: string};
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <Layout>
        <h2 className="text-xl">Course not found</h2>
      </Layout>
    );
  }

  return (
    <Layout title={course.title}>
      <div className="prose">
        <h2 className="text-2xl font-semibold">{course.title}</h2>
        <div className="text-gray-600">{course.university} • {course.code} • {course.level}</div>
        <p className="mt-4">{course.notes}</p>
        <p><strong>Faculty:</strong> {course.faculty}</p>
        <p><strong>Year:</strong> {course.year} • <strong>Salary:</strong> {course.salaryRange}</p>
        <p>
          <a href={course.webpage} target="_blank" rel="noreferrer" className="text-blue-600">Course page</a> •{' '}
          <a href={course.playlist} target="_blank" rel="noreferrer" className="text-blue-600">Playlist</a>
        </p>
      </div>
    </Layout>
  );
}
