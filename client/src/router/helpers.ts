export function withRouteId(routeStr: string, value: string, param = 'id') {
  return routeStr.replace(`:${param}`, value)
}
