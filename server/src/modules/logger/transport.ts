import { format, transports } from 'winston';

import { FileTransportWithFilter } from '@/modules/logger/types';
import 'winston-daily-rotate-file';

export function getFileTransport(
  levelOrOptions: string | FileTransportWithFilter,
) {
  let _data = {
    level: levelOrOptions as string,
    fileSuffix: levelOrOptions as string,
    filter: (info) => info,
  };

  if (typeof levelOrOptions !== 'string') {
    _data = {
      level: levelOrOptions.level,
      fileSuffix: levelOrOptions.fileSuffix || levelOrOptions.level,
      filter: levelOrOptions.filter,
    };
  }

  return new transports.DailyRotateFile({
    // %DATE will be replaced by the current date
    filename: `logs/%DATE%-${_data.fileSuffix}.log`,
    level: _data.level,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false, // don't want to zip our logs
    maxFiles: '15d', // will keep log until they are older than 30 days
    format: format.combine(
      format((info) => {
        if (info.level !== _data.level) return;

        return _data.filter(info) ? info : false;
      })(),
      format.timestamp(),
      format.metadata(),
      format.metadata(),
      format.printf((info) => {
        if (!info || !info.message) return '';

        return info.message;
      }),
    ),
  });
}
