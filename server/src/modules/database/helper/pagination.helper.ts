import { RepositorySource } from '@/modules/database/types';

export class PaginationHelper {
  private readonly DEFAULT_LIMIT = 10;
  private readonly DEFAULT_PAGE = 1;

  constructor(private readonly model: RepositorySource) {}

  public isPaginationActive(pagination: RepositoryPagination = {}) {
    return !(!pagination.limit && !pagination.page);
  }

  public getPaginationOptions(pagination: RepositoryPagination = {}) {
    if (!pagination.limit && !pagination.page) return {};

    const { limit = this.DEFAULT_LIMIT, page = this.DEFAULT_PAGE } = pagination;

    const offset = page === 0 ? 0 : (page - 1) * limit;

    return {
      limit,
      offset,
    };
  }

  public async getMetadata(
    pagination: RepositoryPagination = {},
  ): Promise<PaginationMetadata> {
    const totalItems = await this.model.count();

    const { limit, page = this.DEFAULT_PAGE } = pagination;

    const totalPages = !limit ? 1 : Math.ceil(totalItems / limit);

    return {
      limit,
      page,
      totalItems,
      totalPages,
    };
  }
}
