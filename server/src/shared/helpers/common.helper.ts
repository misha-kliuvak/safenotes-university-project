import { Global, Injectable } from '@nestjs/common';

import { ConfigService } from '@/config';

@Injectable()
@Global()
export class CommonHelper {
  constructor(private readonly configService: ConfigService) {}

  getStaticImage(path: string, ext = 'png'): string {
    const staticFolderUrl = this.configService.getUrlConfig().staticFolderUrl;

    return `${staticFolderUrl}/${path}.${ext}`;
  }
}
