import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@project/shared/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
