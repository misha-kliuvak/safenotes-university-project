import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/config';
import { IUrlConfig } from '@/config/app-config/url.config';
import { UrlUtils } from '@/shared/utils';

@Injectable()
export class LinkFactory {
  private readonly urlConfig: IUrlConfig;

  constructor(private configService: ConfigService) {
    this.urlConfig = this.configService.getUrlConfig();
  }

  public createConfirmEmailLink(token: string): string {
    return `${this.urlConfig.apiUrl}/auth/confirm-email?token=${token}`;
  }

  public createSignUpLink(token: string): string {
    return `${this.urlConfig.signUpUrl}?token=${token}`;
  }

  public createResetPasswordLink(token: string): string {
    return `${this.urlConfig.setNewPasswordUrl}?token=${token}`;
  }

  public createSafeNotePreviewLink(token: string) {
    return `${this.urlConfig.previewSafeUrl}/?token=${token}`;
  }

  public createSafeNoteViewLink(id: string) {
    return UrlUtils.withParams(this.urlConfig.viewSafeUrl, { id });
  }

  public createTermSheetViewLink(id: string) {
    return UrlUtils.withParams(this.urlConfig.viewTermSheetUrl, { id });
  }

  public createReceiptUrl(paymentId: string) {
    return this.urlConfig.apiUrl + `/payment/${paymentId}/receipt`;
  }

  public createPlaidWebhook(): string {
    return `${this.urlConfig.apiUrl}/webhook/plaid`;
  }

  public createCompanyDashboardLink(id: string) {
    return UrlUtils.withParams(this.urlConfig.companyDashboardUrl, { id });
  }
}
