import { TransformableInfo } from 'logform';

interface FileTransportWithFilter {
  level: string;
  fileSuffix?: string;
  filter: (info: TransformableInfo) => boolean;
}

interface ErrorDetails {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  method: string;
  timestamp: string;
}

interface RequestData {
  clientIp: string;
  userAgent: string;
  authorization: string;
}

interface BaseErrorMetadata {
  printToConsole?: boolean;
  saveToFile?: boolean;
}

type LoggerMetadata = Record<string, any>;
