import { Permission } from '@/shared/enums';

export class PermissionUtils {
  static getPermissionHierarchy(permission: Permission): Permission[] {
    const map = {
      [Permission.VIEW]: [],
      [Permission.EDIT]: [Permission.VIEW],
      [Permission.CREATE]: [Permission.EDIT],
    };

    return map[permission] || [];
  }
}
