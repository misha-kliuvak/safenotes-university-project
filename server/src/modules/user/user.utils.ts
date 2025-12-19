export class UserUtils {
  static extractNameFromEmail(email: string): string {
    return email.split('@')[0];
  }
}
