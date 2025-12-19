import { Express, Request } from 'express';

import { RawUser } from '@/modules/user/types';

export type MulterFile = Express.Multer.File;
export type IRequest = Express.Request & Request;
export type RequestWithUser = IRequest & { user: RawUser; userToken: string };
export type UnknownObject = Record<string, unknown>;
export type Callback = (...args: any) => any;

export type Dictionary<T = any> = Record<string, T>;

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
