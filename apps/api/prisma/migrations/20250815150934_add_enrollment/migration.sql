-- Add Enrollment table and relations

-- CreateTable
CREATE TABLE "public"."Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_user_course_key" ON "public"."Enrollment"("userId", "courseId");

-- Add foreign keys
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_user_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_course_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE;
