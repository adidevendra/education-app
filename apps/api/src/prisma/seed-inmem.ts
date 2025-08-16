import 'reflect-metadata';
import { MockPrismaService } from './mock-prisma.service';

async function main() {
  const prisma = new MockPrismaService();

  console.log('Seeding in-memory DB...');

  // create users
  const alice = await prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice' } });
  const bob = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob' } });

  console.log('Created users:', [alice, bob].map((u) => ({ id: (u as any).id, email: (u as any).email })));

  // create courses
  const course1 = await prisma.course.create({ data: { title: 'Intro to TypeScript', description: 'Learn TS basics', published: true } });
  const course2 = await prisma.course.create({ data: { title: 'Advanced NestJS', description: 'Deep dive into NestJS', published: false } });

  console.log('Created courses:', [course1, course2].map((c) => ({ id: (c as any).id, title: (c as any).title })));

  // create lessons linked to courses
  const l1 = await prisma.lesson.create({ data: { title: 'TS Types & Interfaces', content: 'Types, interfaces, unions', courseId: course1.id } });
  const l2 = await prisma.lesson.create({ data: { title: 'Dependency Injection', content: 'Providers, modules', courseId: course2.id } });

  console.log('Created lessons:', [l1, l2].map((l) => ({ id: (l as any).id, title: (l as any).title, courseId: (l as any).courseId })));

  // create enrollments
  const enroll1 = await prisma.enrollment.create({ data: { userId: alice.id, courseId: course1.id } });
  const enroll2 = await prisma.enrollment.create({ data: { userId: bob.id, courseId: course1.id } });

  console.log('Created enrollments:', [enroll1, enroll2].map((e) => ({ id: (e as any).id, userId: (e as any).userId, courseId: (e as any).courseId })));

  console.log('Seeding complete.');
}

main().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
