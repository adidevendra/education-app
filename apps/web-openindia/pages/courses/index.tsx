import React from 'react';
import Layout from '../../components/Layout';
import CourseCard from '../../components/CourseCard';
import {courses} from '../../data/courses';
import {useMemo, useState} from 'react';

export default function CoursesPage() {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');

  const levels = useMemo(() => Array.from(new Set(courses.map((c) => c.level))).sort(), []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesQ = q ? (c.title + ' ' + c.university + ' ' + c.tags + ' ' + c.notes).toLowerCase().includes(q.toLowerCase()) : true;
      const matchesLevel = level ? c.level === level : true;
      return matchesQ && matchesLevel;
    });
  }, [q, level]);

  return (
    <Layout title="Courses">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Courses</h2>
        <div className="flex gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, tags, notes..." className="border rounded px-3 py-2" />
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-gray-600">No courses found.</div>
        ) : (
          filtered.map((c) => <CourseCard key={c.id} course={c} />)
        )}
      </div>
    </Layout>
  );
}
