import { Injectable } from '@nestjs/common';

import { AddressDto } from '@/modules/address/dto/address.dto';
import { AddressRepository } from '@/modules/address/repository/address.repository';
import {
  IRepositoryMethodOptions,
  IUpdateByIdOptions,
} from '@/modules/database/types';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  public async create(data: AddressDto, options?: IRepositoryMethodOptions) {
    if (!data) return null;

    return this.addressRepository.create(data, options);
  }

  public async updateOrCreate(
    id: string,
    data: AddressDto,
    options?: IUpdateByIdOptions,
  ) {
    if (!data) return null;

    const address = await this.addressRepository.getById(id);

    if (!address) {
      return this.addressRepository.create(data, options);
    }

    return this.addressRepository.updateById(id, data, options);
  }

  public async update(
    id: string,
    data: AddressDto,
    options?: IUpdateByIdOptions,
  ) {
    return this.addressRepository.updateById(id, data, options);
  }
}
