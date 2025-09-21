import { db } from './client';
import { orgs, users, memberships, courses, modules, lessons } from './schema';

async function main() {
  const [org] = await db.insert(orgs).values({ slug: 'demo', name: 'Demo Org' }).returning();
  const [user] = await db.insert(users).values({ email: 'demo@example.com', name: 'Demo User' }).returning();
  await db.insert(memberships).values({ orgId: org.id, userId: user.id, role: 'owner' });
  const [course] = await db.insert(courses).values({ orgId: org.id, title: 'Intro to Platform', description: 'Welcome course', visibility: 'public' }).returning();
  const [mod] = await db.insert(modules).values({ courseId: course.id, title: 'Getting Started', position: 1 }).returning();
  await db.insert(lessons).values([
    { moduleId: mod.id, title: 'Lesson 1: Overview', contentMd: '# Overview', position: 1, isPublished: true },
    { moduleId: mod.id, title: 'Lesson 2: Next Steps', contentMd: '# Next Steps', position: 2, isPublished: true },
  ]);
  // eslint-disable-next-line no-console
  console.log('Seed complete:', { org: org.slug, user: user.email, course: course.title });
}

main().then(() => process.exit(0)).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
