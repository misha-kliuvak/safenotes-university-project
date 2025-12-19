import { SetMetadata } from '@nestjs/common';

import { Role } from '@/shared/enums';

export const ROLE_KEY = 'role_key';
export const Roles = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);
