import { Model } from 'sequelize-typescript';

import { DatabaseUtils } from '../database.utils';

describe('DatabaseUtils', () => {
  describe('mergeOptions', () => {
    it('should merge two objects correctly', () => {
      const obj1 = {
        where: {
          id: 1,
        },
        include: ['association1'],
      };

      const obj2 = {
        where: {
          name: 'John',
        },
        include: ['association2'],
      };

      const mergedOptions = DatabaseUtils.mergeOptions(obj1, obj2);

      expect(mergedOptions).toEqual({
        where: {
          id: 1,
          name: 'John',
        },
        include: ['association1', 'association2'],
      });
    });

    it('should handle undefined input objects', () => {
      const obj1 = {
        where: {
          id: 1,
        },
      };

      const mergedOptions = DatabaseUtils.mergeOptions(obj1, undefined);

      expect(mergedOptions).toEqual({
        where: {
          id: 1,
        },
      });
    });
  });

  describe('getEntityName', () => {
    it('should extract entity name correctly', () => {
      class TestEntity extends Model {}

      expect(DatabaseUtils.getEntityName(TestEntity)).toBe('Test');
    });

    it('should handle entity name ending with "Entity"', () => {
      class AnotherEntity extends Model {}

      expect(DatabaseUtils.getEntityName(AnotherEntity)).toBe('Another');
    });
  });
});
