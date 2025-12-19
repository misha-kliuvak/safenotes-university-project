import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

import { StorageUtils } from '@/modules/storage/storage.utils';

@Injectable()
export class FileTypePipe implements PipeTransform {
  constructor(private readonly allowedExtensions: string[] = []) {}

  transform(value: any) {
    if (!value) {
      return undefined;
    }

    const fileExtension = extname(value.originalname)
      .toLowerCase()
      .replace('.', '');

    // if not extensions provided, means all allowed
    if (this.allowedExtensions.length === 0) {
      return value;
    }

    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('Unsupported file type');
    }

    return value;
  }
}

@Injectable()
export class FileSizePipe implements PipeTransform {
  constructor(private readonly maxSize: number) {}

  async transform(value: any) {
    if (!value) {
      return undefined;
    }

    const fileSizeInBytes = value.size;
    const maxSizeInBytes = StorageUtils.convertFileSizeToBytes(this.maxSize);

    if (fileSizeInBytes > maxSizeInBytes) {
      throw new BadRequestException(`File size exceeds ${this.maxSize} MB`);
    }

    return value;
  }
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly required?: boolean,
    private readonly noFileMessage?: string,
  ) {}

  async transform(value: any) {
    if (!value && this.required) {
      throw new BadRequestException(this.noFileMessage || `No file uploaded`);
    }

    return value;
  }
}
