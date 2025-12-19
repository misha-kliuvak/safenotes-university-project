import { SetMetadata } from '@nestjs/common';

import { Permission } from '@/shared/enums';

export const PERMISSION_KEY = 'permission_key';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
