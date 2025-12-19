import { Dictionary } from '@/shared/types';

import { EmailType } from './constants';

export interface BaseEmail {
  to: string;
}

export interface HtmlEmail extends BaseEmail {
  html: string;
}

export interface TemplateEmail extends BaseEmail {
  template: string;
  context: object;
}

export type EmailToSend = (HtmlEmail | TemplateEmail) & {
  type: EmailType;
  subject: string;
  context?: Dictionary;
};
