import { Injectable, StreamableFile } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  home() {
    return {
      message: 'The MySAFEnotes server is running up!',
    };
  }

  async generatePdf(html: string) {
    const styleRegex = /style="(.*?)"/g;
    const newHtml = html.replace(styleRegex, '');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(newHtml, {
      waitUntil: 'domcontentloaded',
    });

    const pdfBuffer = await page.pdf({
      format: 'a4',
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '20mm',
        right: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    return new StreamableFile(pdfBuffer);
  }
}
