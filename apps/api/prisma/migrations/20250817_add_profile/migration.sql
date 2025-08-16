-- Migration: add Profile

CREATE TABLE "Profile" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "bio" text,
  "avatarUrl" text,
  "userId" text UNIQUE NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
