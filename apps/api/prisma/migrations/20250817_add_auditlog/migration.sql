-- Migration: add AuditLog

CREATE TABLE "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid,
  "action" text NOT NULL,
  "resource" text NOT NULL,
  "timestamp" timestamp(3) NOT NULL DEFAULT now()
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog" ("userId");
