import { ENV } from '@/shared/constants';

export class PlatformUtils {
  static isEnv(env: string) {
    return process.env.NODE_ENV === env;
  }

  static isLocalEnv() {
    return process.env.NODE_ENV === ENV.LOCAL;
  }

  static isTestEnv() {
    return process.env.NODE_ENV === ENV.TEST;
  }
}
