import * as fs from 'fs';

export const httpsOptions: any = {
  key: fs.readFileSync('certs/localhost.key'),
  cert: fs.readFileSync('certs/localhost.crt'),
};

export const appOptions = {};
