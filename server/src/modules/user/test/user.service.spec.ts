import { faker } from '@faker-js/faker';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as _ from 'lodash';

import { BaseRepository } from '@/modules/database/base.repository';
import { MailModule } from '@/modules/mail/mail.module';
import { UserPasswordRepository } from '@/modules/user/repository/user-password.repository';
import { UserRepository } from '@/modules/user/repository/user.repository';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestModule } from '@/shared/jest/jest.module';

jest.mock('sequelize-typescript', () => require('@mocks/sequelize-typescript'));

describe('UserService', () => {
  let userService: UserService;
  let userPasswordRepository: UserPasswordRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JestModule,
        SequelizeModule.forRoot({ dialect: 'postgres' }),
        UserModule,
        MailModule,
      ],
    }).compile();

    userService = app.get(UserService);
    userPasswordRepository = app.get(UserPasswordRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getByEmail', () => {
    it('should return null because email not exits', async () => {
      UserRepository.prototype.getByEmail = jest.fn().mockReturnValue(null);

      const result = await userService.getByEmail('non-exist-email@gmail.com');
      expect(result).toEqual(null);
    });

    it('should throw 404 because email not exits', async () => {
      UserRepository.prototype.getByEmail = jest
        .fn()
        .mockImplementation((_, options) => {
          if (options.throwNotFound) {
            throw new NotFoundException('Random message');
          }
          return null;
        });

      try {
        const result = await userService.getByEmail(
          'non-exist-email@gmail.com',
          { throwNotFound: true },
        );

        expect(result).not.toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Random message');
        expect(error.message).not.toBe(true);
      }
    });

    it('should return user by email', async () => {
      const user = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
      };
      UserRepository.prototype.getByEmail = jest.fn().mockReturnValue(user);

      const result = await userService.getByEmail(user.email);
      expect(result).toEqual(user);
    });
  });

  describe('getActiveByEmail', () => {
    it('should return user if active, otherwise return null', async () => {
      const users = Array.from({ length: 12 }).map((_, index) => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        active: index % 2 === 0,
      }));

      UserRepository.prototype.getActiveByEmail = jest
        .fn()
        .mockImplementation((email) => {
          const user = users.find((p) => p.email === email);

          return user.active ? user : null;
        });

      const activeUser = users[0];
      const notActiveUser = users[1];

      const result = await userService.getActiveByEmail(activeUser.email);
      const result2 = await userService.getActiveByEmail(notActiveUser.email);

      expect(result).toEqual(activeUser);
      expect(result2).toEqual(null);
    });
  });

  describe('getByEmailOrCreate', () => {
    it('should return exist user', async () => {
      const user = DataGenerator.user();

      BaseRepository.prototype.customGetOne = jest.fn().mockResolvedValue(user);

      const result = await userService.getByEmailOrCreate(user.email);

      expect(result.email).toBe(user.email);
      expect(BaseRepository.prototype.customGetOne).toBeCalled();
    });

    it('should return created user', async () => {
      const user = DataGenerator.user();

      BaseRepository.prototype.create = jest.fn().mockResolvedValue(user);

      const result = await userService.getByEmailOrCreate(user);

      expect(result.email).toBe(user.email);
      expect(BaseRepository.prototype.customGetOne).toBeCalled();
      expect(BaseRepository.prototype.create).toBeCalledWith(user);
    });
  });

  describe('create', () => {
    let user;

    beforeEach(() => {
      user = DataGenerator.userWithPassword();
    });

    it('should return error because email already in use', async () => {
      UserRepository.prototype.getByEmail = jest
        .fn()
        .mockResolvedValue({ active: true });

      try {
        await userService.create(user);
      } catch (error) {
        expect(error.status).toEqual(409);
        expect(error.response.email).toContain(
          'Email already taken. Please use a different email address.',
        );
      }
    });

    it('should return created user if data is valid', async () => {
      UserRepository.prototype.create = jest.fn().mockResolvedValue(user);
      UserRepository.prototype.updateById = jest.fn().mockResolvedValue(user);
      UserRepository.prototype.getById = jest.fn().mockResolvedValue(user);
      UserPasswordRepository.prototype.savePassword = jest
        .fn()
        .mockResolvedValue(null);

      const result = await userService.create(user);

      expect(UserPasswordRepository.prototype.savePassword).toBeCalled();

      expect(result).toEqual(user);
    });
  });

  describe('authenticate', () => {
    it('should throw UnauthorizedException as email not exists', async () => {
      const user = DataGenerator.userWithPassword();

      UserRepository.prototype.getActiveByEmail = jest
        .fn()
        .mockResolvedValue(null);

      try {
        await userService.authenticate(user);
      } catch (error) {
        expect(error.status).toEqual(401);
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response.email).toContain(
          'User with such email not found',
        );
      }
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const user = DataGenerator.userWithPassword();

      UserRepository.prototype.getActiveByEmail = jest
        .fn()
        .mockResolvedValue(user);

      UserPasswordRepository.prototype.getPassword = jest
        .fn()
        .mockResolvedValue('random-password');

      try {
        await userService.authenticate(user);
      } catch (error) {
        expect(error.status).toEqual(401);
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response.email).toContain('Invalid credentials');
        expect(error.response.password).toContain('Invalid credentials');
      }
    });

    it('should authenticate a user with valid credentials', async () => {
      const user = DataGenerator.userWithPassword({ id: 1 });

      UserRepository.prototype.getActiveByEmail = jest
        .fn()
        .mockResolvedValue(_.omit(user, 'password'));

      UserPasswordRepository.prototype.getPassword = jest
        .fn()
        .mockResolvedValue(
          await userPasswordRepository.encryptPassword(user.password),
        );

      const result = await userService.authenticate(user);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.fullName).toBe(user.fullName);
      expect((result as any)?.password).not.toBeDefined();
    });
  });
});
