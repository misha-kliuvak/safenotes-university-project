import { Model } from 'sequelize-typescript';

export class DatabaseUtils {
  static mergeOptions(obj1, obj2) {
    const mergedOptions = {
      ...(obj1 || {}),
      ...(obj2 || {}),
    };

    // Merge the 'where' property of obj1 and obj2 if either of them has it
    if (obj1?.where || obj2?.where) {
      mergedOptions.where = {
        ...(obj1?.where || {}),
        ...(obj2?.where || {}),
      };
    }

    // Merge the 'include' property of obj1 and obj2 if either of them has it
    if (obj1?.include || obj2?.include) {
      mergedOptions.include = [
        ...(obj1?.include || []),
        ...(obj2?.include || []),
      ];
    }

    return mergedOptions;
  }

  static getEntityName(entity: typeof Model) {
    return entity.name.replace('Entity', '');
  }
}
