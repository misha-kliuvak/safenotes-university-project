import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  HasOne,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { OAuthProvider } from '@/modules/auth/types';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';

@Table({ tableName: 'user' })
export class UserEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @IsEmail
  @Column({
    type: DataType.STRING,
    field: 'email',
  })
  email: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'email_verified',
    defaultValue: false,
  })
  emailVerified: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'full_name',
  })
  fullName: string;

  @Column({
    type: DataType.JSON,
    field: 'oauth_providers',
  })
  oauthProviders: OAuthProvider[];

  @Column({
    type: DataType.STRING,
    field: 'image',
  })
  image: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'active',
    defaultValue: false,
  })
  active: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'otp_enabled',
    defaultValue: false,
  })
  otpEnabled: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'otp_verified',
    defaultValue: false,
  })
  otpVerified: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'otp_auth_url',
    defaultValue: null,
  })
  otpAuthUrl: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'otp_secret',
    defaultValue: null,
  })
  otpSecret: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'plaid_access_token',
    defaultValue: null,
  })
  plaidAccessToken: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'plaid_item_id',
    defaultValue: null,
  })
  plaidItemId: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_onboarding_complete',
    defaultValue: false,
  })
  isOnboardingComplete: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt: Date;

  @HasOne(() => SubscriptionEntity, { as: 'activeSubscription' })
  activeSubscription?: SubscriptionEntity;

  public toJSON<T>(): T {
    // once user enabled 2FA
    // we don't want to send otpSecret and otpAuthUrl
    // to avoid security issues
    if (this.otpEnabled) {
      this.otpSecret = null;
      this.otpAuthUrl = null;
    }

    this.plaidAccessToken = null;
    this.plaidItemId = null;

    return super.toJSON();
  }
}
