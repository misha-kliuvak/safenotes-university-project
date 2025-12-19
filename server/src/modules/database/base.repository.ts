import { BadRequestException, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CreateOptions } from 'sequelize';
import { AggregateOptions, UpdateOptions } from 'sequelize/types/model';
import { Transaction } from 'sequelize/types/transaction';
import { Model } from 'sequelize-typescript';

import { DatabaseUtils } from '@/modules/database/database.utils';
import { Logger } from '@/modules/logger/logger';

import { RepositoryHelper } from './helper/repository.helper';
import {
  IBaseRepository,
  ICreateOptions,
  IDeleteByOptions,
  IDeleteOptions,
  IFindByIdOptions,
  IFindOptions,
  IUpdateByIdOptions,
  IUpdateOptions,
  PredefinedFilters,
  RepositorySource,
} from './types';

export class BaseRepository<T extends Model> implements IBaseRepository<T> {
  private readonly logger = new Logger(BaseRepository.name);

  // Needs only for injection
  public static Entity: RepositorySource;

  private readonly repositoryHelper: RepositoryHelper;
  protected model: RepositorySource<T>;

  public constructor(model: RepositorySource<T>) {
    this.model = model;

    this.repositoryHelper = new RepositoryHelper(
      model,
      this.predefinedFilters(),
    );
  }

  /**
   * Predefined filters
   * @private
   */
  protected predefinedFilters(): PredefinedFilters {
    return {};
  }

  public transaction(autoCallback?: (t: Transaction) => PromiseLike<any>) {
    return this.model.sequelize.transaction(autoCallback);
  }

  // can be moved to repository helper
  public async customGetOne(options: IFindOptions) {
    let key: string, value: any;
    const whereId = Object.entries(options?.where).find(
      ([key, value]) => key === 'id',
    );

    if (whereId) {
      [key, value] = whereId;
    } else {
      key = Object.keys(options.where)[0];
      value = Object.values(options.where)[0];
    }

    const entityName = DatabaseUtils.getEntityName(this.model);

    // to check if value is uuid but not valid
    if (key === 'id' && value && !isUUID(value)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    let entity: T;
    try {
      const enhancedOptions = this.repositoryHelper.enhanceOptions(options);
      entity = await this.model.findOne<T>(enhancedOptions);
    } catch (error) {}

    if (!entity && options?.throwNotFound) {
      const message = `${entityName} by key: *${key}* with value: *${value}* was not found`;
      throw new NotFoundException(message);
    }

    if (options?.toJson) {
      return entity.toJSON();
    }

    return entity;
  }

  /**
   * Get all entity
   * @param options
   */
  async getAll(options?: IFindOptions): Promise<T[]> {
    const response = await this.repositoryHelper.complexGetAll(options);

    return response as any;
    // return DatabaseUtils.withDynamicFilters(response, options?.dynamicFilters);
  }

  async count(options?: IFindOptions): Promise<number> {
    return this.model.count(options);
  }

  /**
   * Get one entity with some options
   * @param options
   */
  async getOne(options: IFindOptions): Promise<T | null> {
    return this.customGetOne(options);
  }

  /**
   * Get entity by primary key
   * @param id
   * @param options
   */
  async getById(id: string, options?: IFindByIdOptions): Promise<T | null> {
    return this.customGetOne({
      ...options,
      where: { ...options?.where, id },
    });
  }

  /**
   * Create entity
   * @param model, fields with data
   * @param options
   */
  async create(model: any, options?: ICreateOptions): Promise<T> {
    const result = await this.model.create(model, options as CreateOptions);

    // if entity has an id, return entity by id, otherwise return created entity
    if (result?.id) {
      return this.getById(result.id, {
        throwNotFound: false,
        transaction: options?.transaction,
      });
    }

    return result as T;
  }

  /**
   * Get one entity with some options
   * @param options
   * @param data
   */
  async getOneOrCreate(options: IFindOptions, data?: any): Promise<T | null> {
    const entity = await this.customGetOne(options);

    if (entity) return entity;

    return this.create(data);
  }

  /**
   * Updating entity
   * @param values
   * @param options
   */
  async update(values: any, options: IUpdateOptions): Promise<T> {
    if (options.throwNotFound) {
      // to check if entity exists first
      await this.customGetOne(options);
    }

    await this.model.update(values, options as UpdateOptions);

    if (options.returning === false) return;

    return this.customGetOne(options);
  }

  /**
   * Updating entity by id
   * @param id
   * @param values
   * @param options
   */
  async updateById(
    id: string,
    values: any,
    options?: IUpdateByIdOptions,
  ): Promise<T> {
    await this.update(values, {
      where: { id },
      ...options,
    });

    return this.getById(id, options);
  }

  /**
   * Base delete entity method
   */
  async delete({ throwNotFound, ...options }: IDeleteOptions): Promise<number> {
    await this.customGetOne({
      ...options,
      paranoid: false,
      throwNotFound: throwNotFound,
    });
    return this.model.destroy(options);
  }

  /**
   * Delete entity by
   */
  async deleteBy(
    key: string,
    value: string | string[],
    options?: IDeleteByOptions,
  ): Promise<any> {
    return this.delete({
      where: { [key]: value },
      ...options,
    });
  }

  /**
   * Delete entity by id
   */
  async deleteById(id: string, options?: IDeleteByOptions): Promise<any> {
    return this.deleteBy('id', id, options);
  }

  async max(field: string, options?: AggregateOptions<T>) {
    return this.model.max(field as never, options);
  }
}
