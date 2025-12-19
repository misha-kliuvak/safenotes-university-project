interface PaginationMetadata {
  limit: number;
  page: number;
  totalItems: number;
  totalPages: number;
}

interface RepositoryPagination {
  page?: number;
  limit?: number;
}

interface ResponsePagination<T> {
  data: T[];
  metadata: PaginationMetadata;
}
