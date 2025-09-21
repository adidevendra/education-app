import { z } from 'zod';

export enum Role {
  Owner = 'owner',
  Admin = 'admin',
  Instructor = 'instructor',
  TA = 'ta',
  Student = 'student',
  Viewer = 'viewer',
}

export enum PermissionAction {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  orgId: z.string().optional().nullable(),
  roles: z.array(z.nativeEnum(Role)).optional(),
});

export type SessionUser = z.infer<typeof SessionUserSchema>;

export function parseJwtToSessionUser(token: string | null | undefined): SessionUser | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    const parsed = SessionUserSchema.safeParse({
      id: json.sub ?? json.id,
      email: json.email,
      orgId: json.orgId ?? null,
      roles: json.roles,
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
