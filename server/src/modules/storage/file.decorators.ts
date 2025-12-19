import { UploadedFile } from '@nestjs/common';

import {
  FileSizePipe,
  FileTypePipe,
  FileValidationPipe,
} from '@/modules/storage/file.pipe';

interface DecoratorOptions {
  fileSize?: number; // in mb
  extensions?: string[];
  required?: boolean;
  noFileMessage?: string;
}

export const BodyFile = (options?: DecoratorOptions) => {
  const extensions = options?.extensions;
  const fileSize = options?.fileSize || 10;

  return UploadedFile(
    new FileValidationPipe(options?.required, options?.noFileMessage),
    new FileSizePipe(fileSize),
    new FileTypePipe(extensions),
  );
};
