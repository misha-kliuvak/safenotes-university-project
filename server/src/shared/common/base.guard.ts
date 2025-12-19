import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isUUID } from 'class-validator';

import { IS_PUBLIC_DECORATOR_KEY } from '@/shared';
import {
  SKIP_GUARD_DECORATOR_KEY,
  SkipGuardValue,
} from '@/shared/decorators/skip.decorator';

export abstract class BaseGuard implements CanActivate {
  protected constructor(readonly reflector: Reflector) {}

  public async isSkipGuard(context: ExecutionContext): Promise<boolean> {
    const value = this.reflector.get<SkipGuardValue>(
      SKIP_GUARD_DECORATOR_KEY,
      context.getHandler(),
    );

    if (
      (typeof value === 'boolean' && value) ||
      (Array.isArray(value) && value.includes(this.constructor.name))
    ) {
      return true;
    }
  }

  public async isPublicRoute(context: ExecutionContext): Promise<boolean> {
    return this.reflector.get<boolean>(
      IS_PUBLIC_DECORATOR_KEY,
      context.getHandler(),
    );
  }

  public uuidValidation(value: string) {
    if (!isUUID(value)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = await this.isPublicRoute(context);
    const isSkipGuard = await this.isSkipGuard(context);

    return isPublicRoute || isSkipGuard;
  }
}
