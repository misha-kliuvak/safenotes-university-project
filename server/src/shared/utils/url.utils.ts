import { QueryOptions } from '@/modules/database/types';
import { Dictionary } from '@/shared/types';

export class UrlUtils {
  /**
   * Format string to url with params, example::
   * route/:id -> route/1
   * @param endpoint
   * @param params object with params, url should contain keys from object
   */
  static withParams(endpoint: string, params: Dictionary<string>) {
    let urlWithPatchedParams = endpoint;

    Object.keys(params).forEach((key: string) => {
      if (urlWithPatchedParams.includes(key)) {
        urlWithPatchedParams = urlWithPatchedParams.replace(
          `:${key}`,
          params[key],
        );
      }
    });

    return urlWithPatchedParams;
  }

  /**
   * Create string with query params based on object, example:
   * { token: [token] }
   * return a string 'https://.....?token=[token]
   * @param url
   * @param queries
   */
  static withQuery(url: string, queries: Record<string, any>) {
    if (!queries || Object.keys(queries).length < 1) return url;

    const queryArr = Object.keys(queries).map(
      (key) => `${key}=${queries[key]}`,
    );
    const queryString = queryArr.join('&');

    return `${url}?${queryString}`;
  }

  /**
   * Create string with query params based on query options, example:
   * { pagination: {limit: 2}, filters: {id: '3} }
   * return a string 'https://.....?limit=[token]?id=3
   * @param url
   * @param query
   */
  static withQueryOptions(url: string, query: QueryOptions) {
    return UrlUtils.withQuery(url, {
      ...query?.filters,
      ...query?.pagination,
      ...query?.sorting,
    });
  }
}
