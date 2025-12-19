import { OAuthProvider } from '@/modules/auth/types';

interface RawUser {
  id: string;
  email: string;
  fullName: string;
  oauthProviders: OAuthProvider[];
  emailVerified: boolean;
  otpEnabled: boolean;
  otpVerified: boolean;
  otpAuthUrl: string;
}
