import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { TermSheetUserEntity } from '@/modules/term-sheet/entity/term-sheet-user.entity';

@Table({ tableName: 'term_sheet' })
export class TermSheetEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => CompanyEntity)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'sender_company_id',
  })
  senderCompanyId: string;

  @BelongsTo(() => CompanyEntity)
  senderCompany?: CompanyEntity;

  @AllowNull(true)
  @Column({
    type: DataType.DOUBLE,
    field: 'round_amount',
    defaultValue: null,
  })
  roundAmount: number;

  @AllowNull(true)
  @Column({
    type: DataType.FLOAT,
    field: 'discount_rate',
    defaultValue: null,
  })
  discountRate: number;

  @AllowNull(true)
  @Column({
    type: DataType.DOUBLE,
    field: 'valuation_cap',
    defaultValue: null,
  })
  valuationCap: number;

  @AllowNull(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'mfn',
    defaultValue: false,
  })
  mfn: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'signature',
    defaultValue: null,
  })
  signature: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'sign_date',
    defaultValue: null,
  })
  signDate: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'sign_name',
    defaultValue: null,
  })
  signName: string;

  @CreatedAt
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt: Date;

  @HasMany(() => TermSheetUserEntity, { as: 'recipients' })
  recipients: TermSheetUserEntity[];

  @HasOne(() => TermSheetUserEntity, { as: 'termSheetUser' })
  termSheetUser: TermSheetUserEntity;

  @Column({
    type: DataType.VIRTUAL(),
  })
  get sender() {
    return this.senderCompany?.owner;
  }

  public toJSON() {
    const json = super.toJSON();

    if (json.senderCompany) {
      json.senderCompany = this.senderCompany?.toJSON();
    }

    return json;
  }
}
