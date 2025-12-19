import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { LoginDto } from '@/modules/auth/dto/login.dto';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { TxService } from '@/modules/database/tx.service';
import {
  ICreateOptions,
  IFindByIdOptions,
  IFindOptions,
  IUpdateByIdOptions,
  Transaction,
  TransactionOptions,
} from '@/modules/database/types';
import { OtpService } from '@/modules/otp/otp.service';
import { StorageService } from '@/modules/storage/service/storage.service';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enums';
import { TokenService } from '@/modules/token/token.service';
import { ValidatedToken } from '@/modules/token/types';
import { CreateOAuthUserDto } from '@/modules/user/dto/create-o-auth-user.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { RegisterOtpAuthDto } from '@/modules/user/dto/register-otp-auth.dto';
import { UpdateOtpAuthDto } from '@/modules/user/dto/update-otp-auth.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserPasswordRepository } from '@/modules/user/repository/user-password.repository';
import { UserRepository } from '@/modules/user/repository/user.repository';
import { UserHelper } from '@/modules/user/user.helper';
import { MulterFile } from '@/shared/types';

@Injectable()
export class UserService extends BaseServiceImpl<UserEntity> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sequelizeInstance: Sequelize,
    private readonly userPasswordRepository: UserPasswordRepository,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService,
    private readonly txService: TxService,
    private readonly otpService: OtpService,
    public readonly helper: UserHelper,
  ) {
    super(userRepository);
  }

  async getByEmail(email: string, options?: IFindOptions) {
    return this.userRepository.getByEmail(email, options);
  }

  async getActiveByEmail(email: string, options?: IFindOptions) {
    return this.userRepository.getActiveByEmail(email, options);
  }

  async getUserByID(
    id: string,
    options?: IFindByIdOptions,
  ): Promise<UserEntity> {
    const currentDate = new Date();
    return this.getById(id, {
      throwNotFound: true,
      include: [
        {
          model: SubscriptionEntity,
          as: 'activeSubscription',
          required: false,
          where: {
            startAt: { [Op.lte]: currentDate },
            endAt: { [Op.gte]: currentDate },
            status: SubscriptionStatus.ACTIVE,
          },
        },
      ],
      ...options,
    });
  }

  async getPublicUserByEmail(email: string) {
    return this.getActiveByEmail(email, {
      attributes: ['email', 'fullName', 'image'],
    });
  }

  async getByEmailOrCreate(data: CreateUserDto, options?: TransactionOptions) {
    return this.userRepository.getOneOrCreate(
      {
        where: { email: data.email },
        transaction: options?.transaction,
      },
      data,
    );
  }

  public async authenticate(loginData: LoginDto): Promise<UserEntity> {
    const { email, password } = loginData;

    const user = await this.userRepository.getActiveByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        email: ['Invalid credentials'],
        password: ['Invalid credentials'],
      });
    }

    const passwordMatch = await this.userPasswordRepository.comparePasswords(
      user.id,
      password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException({
        email: ['Invalid credentials'],
        password: ['Invalid credentials'],
      });
    }

    return user;
  }

  /**
   * Extract user from token and validate it
   * As well as check if user exists in database
   * @param token
   */
  public async validateUserToken(token: string) {
    const response = await this.tokenService.validateAccessToken(token);

    const invalidToken: ValidatedToken = {
      valid: false,
      data: null,
    };

    if (response?.valid) {
      const [userById, userByEmail] = await Promise.all([
        this.getById(response.data.id),
        this.getByEmail(response.data.email),
      ]);

      return userById || userByEmail ? response : invalidToken;
    }

    return invalidToken;
  }

  async createUserWithToken(data: CreateUserDto) {
    const response = await this.tokenService.validateServiceToken(data.token);

    if (response.valid) {
      return this.txService.transaction(async (transaction) => {
        const user = await this.getByEmailOrCreate(data, { transaction });

        await this.tokenService.invalidate(data.token, { transaction });
        await this._rawUpdateById(user.id, data, { transaction });

        return this.getUserByID(user.id, { transaction });
      });
    }

    throw new BadRequestException('Invalid or expired token!');
  }

  public async create(
    data: CreateUserDto | CreateOAuthUserDto,
    options?: ICreateOptions,
  ): Promise<UserEntity> {
    const candidate = await this.userRepository.getByEmail(data.email);
    if (candidate) {
      throw new ConflictException({
        email: ['Email already taken. Please use a different email address.'],
      });
    }

    const user = await this.userRepository.create(data, options);

    if ('password' in data && data.password) {
      await this.userPasswordRepository.savePassword(user.id, data.password, {
        transaction: options?.transaction,
      });
    }

    return user;
  }

  private async _rawUpdateById(
    userId: string,
    data: any,
    options?: IUpdateByIdOptions,
  ) {
    return this.txService.transaction(async (transaction) => {
      await this.userRepository.updateById(userId, data, options);

      if (data.password) {
        await this.savePassword(userId, data.password, { transaction });
      }

      return this.getUserByID(userId, { transaction });
    }, options?.transaction);
  }

  /**
   * The function throw error in case if email already exist
   * Update works only in case if user was created with active: false
   * @param data
   * @param options
   */
  async createOrUpdate(
    data: CreateUserDto,
    options?: TransactionOptions,
  ): Promise<UserEntity> {
    if (data.token) {
      return this.createUserWithToken(data);
    }

    const candidate = await this.getByEmail(data.email, options);

    // update candidate
    if (candidate?.id && !candidate.active) {
      return this._rawUpdateById(candidate.id, data, options);
    }

    return this.create(data);
  }

  /**
   * Almost same as createOrUpdate, but in case of same email
   * the function will update user if active = false, or just return user
   * if active = true
   * @param data
   * @param options
   */
  async getOrCreateOrUpdate(
    data: Omit<CreateUserDto, 'token'>,
    options?: TransactionOptions,
  ): Promise<UserEntity> {
    const candidate = await this.getByEmailOrCreate(data, options);

    // update candidate
    if (candidate?.id && !candidate.active) {
      return this._rawUpdateById(candidate.id, data, options);
    }

    return candidate;
  }

  public async verifyEmail(userId: string) {
    await this.userRepository.updateById(userId, { emailVerified: true });
  }

  public async activateUser(
    userId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await this.updateById(userId, { active: true }, { transaction });
  }

  public async savePassword(
    userId: string,
    password: string,
    options?: IUpdateByIdOptions,
  ) {
    await this.userPasswordRepository.savePassword(userId, password, options);
  }

  public async saveUserImage(
    userId: string,
    image: string | MulterFile,
    transaction?: Transaction,
  ) {
    if (typeof image === 'string') {
      await this.updateById(userId, { image }, { transaction });
      return;
    }

    const file = await this.storageService.saveUserFile({
      file: image,
      userId,
      fileName: 'user-image',
    });

    await this.updateById(userId, { image: file?.url }, { transaction });
    return;
  }

  public async updateUserPasswords(
    userId: string,
    oldPassword: string,
    newPassword: string,
    transaction?: Transaction,
  ): Promise<void> {
    const passwordMatch = await this.userPasswordRepository.comparePasswords(
      userId,
      oldPassword,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Invalid old password');
    }

    const isNewPasswordSameAsOldOne =
      await this.userPasswordRepository.comparePasswords(userId, newPassword);

    if (isNewPasswordSameAsOldOne) {
      throw new BadRequestException(
        'The new password cannot be the same as the old password.',
      );
    }

    await this.userPasswordRepository.savePassword(userId, newPassword, {
      transaction,
    });
  }

  public async update(
    userId: string,
    {
      image,
      oldPassword,
      newPassword,
      email,
      verificationCode,
      ...dto
    }: UpdateUserDto,
    options?: IUpdateByIdOptions,
  ) {
    const user = await this.getById(userId);

    return this.txService.transaction(async (transaction) => {
      let updateData: UpdateUserDto & { emailVerified?: boolean } = {
        ...dto,
      };

      if (oldPassword) {
        await this.updateUserPasswords(
          userId,
          oldPassword,
          newPassword,
          transaction,
        );
      }

      if (user.oauthProviders?.length > 0 && email) {
        throw new ForbiddenException(
          'You cannot change your email as you logged in with social accounts',
        );
      }

      if (email && verificationCode) {
        await this.otpService.validate(
          await this.otpService.convertInputToSecret(userId),
          verificationCode,
          true,
        );
      }

      if (email && email !== user.email) {
        const userExists = await this.getByEmail(email);

        if (userExists) {
          throw new ForbiddenException('User with such email already exists');
        }

        this.helper.sendWelcomeEmail(email, user.fullName);

        updateData = {
          ...updateData,
          email,
          emailVerified: false,
        };
      }

      await this.userRepository.updateById(userId, { ...updateData }, options);
      await this.saveUserImage(userId, image, transaction);

      return this.getUserByID(userId, { transaction });
    }, options?.transaction);
  }

  public async registerOtpAuth(userId: string, dto: RegisterOtpAuthDto) {
    return this.updateById(userId, dto);
  }

  public async updateOtpAuth(userId: string, dto: UpdateOtpAuthDto) {
    return this.updateById(userId, dto);
  }
}
