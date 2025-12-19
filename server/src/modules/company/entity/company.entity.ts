import * as _ from 'lodash';
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { AddressEntity } from '@/modules/address/entity/address.entity';
import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { CompanyPaymentEntity } from '@/modules/company/entity/company-payment.entity';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { CompanyType, VerificationStatus } from '@/modules/company/enums';
import { CompanyOwner } from '@/modules/company/types';
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { Role } from '@/shared/enums';

@Table({ tableName: 'company' })
export class CompanyEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'name',
  })
  name: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'main_name',
  })
  mainName?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'image',
    defaultValue: null,
  })
  image: string;

  @AllowNull(true)
  @Column({
    type: DataType.NUMBER,
    field: 'goal',
  })
  goal: number;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(
      VerificationStatus.VERIFIED,
      VerificationStatus.PENDING,
      VerificationStatus.NOT_VERIFIED,
    ),
    field: 'verification_status',
    defaultValue: VerificationStatus.NOT_VERIFIED,
  })
  verificationStatus: VerificationStatus;

  @ForeignKey(() => AddressEntity)
  @Column({
    type: DataType.UUID,
    field: 'address_id',
  })
  addressId: string;

  @BelongsTo(() => AddressEntity)
  address: AddressEntity;

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

  @DeletedAt
  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'deleted_at',
  })
  public deletedAt?: Date;

  @Column({
    type: DataType.DATE,
    field: 'verification_end_at',
  })
  verificationEndAt: Date;

  @HasOne(() => AngelCompanyEntity)
  angelCompany?: AngelCompanyEntity;

  @HasOne(() => EntrepreneurCompanyEntity)
  entrepreneurCompany?: EntrepreneurCompanyEntity;

  @HasMany(() => SafeNoteEntity, { as: 'safeNotes' })
  safeNotes: SafeNoteEntity[];

  @BelongsToMany(() => PaymentEntity, () => CompanyPaymentEntity)
  payments: PaymentEntity[];

  @HasOne(() => CompanyUserEntity, {
    as: 'companyUser',
  })
  companyUser?: CompanyUserEntity;

  @HasMany(() => CompanyUserEntity, { as: 'companyUsers' })
  companyUsers?: CompanyUserEntity[];

  @Column({ type: DataType.VIRTUAL })
  get type(): CompanyType {
    return this.angelCompany?.type || this.entrepreneurCompany?.type;
  }

  @Column({ type: DataType.VIRTUAL })
  get owner(): CompanyOwner {
    if (!this.companyUsers) return null;

    const companyUser = this.companyUsers.find((p) => p.role === Role.OWNER);

    if (!companyUser) return null;

    return {
      id: companyUser.user.id,
      fullName: companyUser.user.fullName,
      email: companyUser.user.email,
      image: companyUser.user.image,
      emailVerified: companyUser.user.emailVerified,
      position: companyUser.position,
    };
  }

  @Column({ type: DataType.VIRTUAL })
  get teamMembers(): CompanyUserEntity[] {
    if (!this.companyUsers?.length) return [];

    return this.companyUsers.filter((p) => p.role === Role.TEAM_MEMBER);
  }

  public toJSON(): any {
    const json = super.toJSON();

    const omitFields = ['id', 'parentId'];

    const angelCompanyData = _.omit(json?.angelCompany, omitFields);
    const entrepreneurCompanyData = _.omit(
      json?.entrepreneurCompany,
      omitFields,
    );

    delete json?.angelCompany;
    delete json?.entrepreneurCompany;
    delete json?.safeNotesSummary;
    delete json?.companyUsers;

    return {
      ...json,
      ...angelCompanyData,
      ...entrepreneurCompanyData,
    };
  }
}
