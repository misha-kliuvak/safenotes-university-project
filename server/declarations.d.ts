declare namespace Express {
  export interface Request {
    user: {
      id: string;
    };
    params: unknown;
    query: unknown;
    body: unknown;
    clientIp: string;
  }
}
