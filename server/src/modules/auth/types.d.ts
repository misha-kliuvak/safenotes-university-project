import { OAuthStrategy } from '@/modules/auth/enums';
import { UserEntity } from '@/modules/user/entity/user.entity';

export interface OAuthProvider {
  strategy: OAuthStrategy;
  id?: string;
}

export interface AuthResponse {
  user: UserEntity;
  accessToken: string;
}

export interface OAuthUserModel {
  email: string;
  fullName: string;
  image?: string;
  provider: OAuthProvider;
}

export interface AuthenticatedUser {
  id: string;
  isNew: boolean;
}
