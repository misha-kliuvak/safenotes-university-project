import { json } from 'body-parser';
import { Response } from 'express';

import { RequestWithRawBody } from '@/shared/types';

export function RawBodyMiddleware() {
  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
      const webhookPattern = /\/.*\/webhook\/.*/;

      if (webhookPattern.test(request.url) && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }

      return true;
    },
  });
}
