import { RepositorySorting, RepositorySource } from '@/modules/database/types';

export class SortingHelper {
  constructor(private readonly model: RepositorySource) {}

  public getSortingOptions(sorting: RepositorySorting) {
    const modelAttributes = Object.keys(this.model.getAttributes());

    const defaultSorting = modelAttributes.includes('createdAt')
      ? [['createdAt', 'DESC']]
      : [];

    if (!sorting || !Object.keys(sorting).length) {
      return {
        order: defaultSorting,
      };
    }

    const order = [];

    Object.keys(sorting).forEach((key) => {
      if (modelAttributes.includes(key)) {
        order.push([key, sorting[key]]);
      }
    });

    return { order };
  }
}
