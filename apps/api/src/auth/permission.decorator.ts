import { SetMetadata } from '@nestjs/common';

export type PermissionTuple = { action: string; resource: string };
export const PERMISSIONS_KEY = 'permissions';
export const Permission = (action: string, resource: string) => SetMetadata(PERMISSIONS_KEY, [{ action, resource }]);
