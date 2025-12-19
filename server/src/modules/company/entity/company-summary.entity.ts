import {
  AllowNull,
  Column,
  DataType,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { CompanyType } from '@/modules/company/enums';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';

@Table({
  tableName: 'company',
  timestamps: false,
})
export class CompanySummaryEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @DeletedAt
  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'deleted_at',
  })
  public deletedAt?: Date;

  @HasOne(() => CompanyUserEntity, {
    as: 'companyUser',
    foreignKey: 'companyId',
  })
  companyUser?: CompanyUserEntity;

  @HasOne(() => AngelCompanyEntity, {
    foreignKey: 'parentId',
  })
  angelCompany?: AngelCompanyEntity;

  @HasOne(() => EntrepreneurCompanyEntity, {
    foreignKey: 'parentId',
  })
  entrepreneurCompany?: EntrepreneurCompanyEntity;

  @HasMany(() => SafeNoteEntity, {
    as: 'tiedSafes',
    foreignKey: 'recipientCompanyId',
  })
  tiedSafes: SafeNoteEntity[];

  @HasMany(() => SafeNoteEntity, {
    as: 'sentSafes',
    foreignKey: 'senderCompanyId',
  })
  sentSafes: SafeNoteEntity[];

  @Column({ type: DataType.VIRTUAL })
  get type(): CompanyType {
    return this.angelCompany?.type || this.entrepreneurCompany?.type;
  }

  public toJSON(): any {
    const json: Awaited<CompanySummaryEntity> = super.toJSON();

    delete json?.angelCompany;
    delete json?.entrepreneurCompany;

    return json;
  }
}
