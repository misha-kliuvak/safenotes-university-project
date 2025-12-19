import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import { SafeFor, SafeNoteStatus } from '@/modules/safe-note/enums';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { SafeNoteData } from '@/modules/safe-note/types';

@Table({ tableName: 'safe_note' })
export class SafeNoteEntity extends Model {
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

  @BelongsTo(() => CompanyEntity, { as: 'senderCompany' })
  senderCompany?: CompanyEntity;

  @ForeignKey(() => UserEntity)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'recipient_id',
  })
  recipientId?: string;

  @BelongsTo(() => UserEntity)
  recipient: UserEntity;

  @ForeignKey(() => CompanyEntity)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'recipient_company_id',
    defaultValue: null,
  })
  recipientCompanyId: string;

  @BelongsTo(() => CompanyEntity, { as: 'recipientCompany' })
  recipientCompany: CompanyEntity;

  @ForeignKey(() => TermSheetEntity)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'term_sheet_id',
    defaultValue: null,
  })
  termSheetId: string;

  @BelongsTo(() => TermSheetEntity)
  termSheet: TermSheetEntity;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(SafeFor.ANGEL, SafeFor.AGENCY, SafeFor.ENTREPRENEUR),
    field: 'safe_for',
  })
  safeFor: SafeFor;

  @AllowNull(true)
  @Column({
    type: DataType.DOUBLE,
    field: 'safe_amount',
    defaultValue: null,
  })
  safeAmount: number;

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
    field: 'sender_signature',
    defaultValue: null,
  })
  senderSignature: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'sender_sign_date',
    defaultValue: null,
  })
  senderSignDate: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'sender_sign_name',
    defaultValue: null,
  })
  senderSignName: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'recipient_signature',
    defaultValue: null,
  })
  recipientSignature: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'recipient_sign_date',
    defaultValue: null,
  })
  recipientSignDate: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'recipient_sign_name',
    defaultValue: null,
  })
  recipientSignName: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      SafeNoteStatus.DRAFT,
      SafeNoteStatus.SENT,
      SafeNoteStatus.CANCELLED,
      SafeNoteStatus.SIGNED,
      SafeNoteStatus.DECLINED,
    ),
    field: 'status',
    defaultValue: SafeNoteStatus.DRAFT,
  })
  status: SafeNoteStatus;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'paid',
    defaultValue: false,
  })
  paid: boolean;

  @ForeignKey(() => PaymentEntity)
  @Column({
    type: DataType.UUID,
    field: 'payment_id',
  })
  paymentId: string;

  @BelongsTo(() => PaymentEntity)
  payment: PaymentEntity;

  @Column({
    type: DataType.JSON,
    field: 'data',
  })
  data: SafeNoteData;

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

    if (json.recipientCompany) {
      json.recipientCompany = this.recipientCompany?.toJSON();
    }

    if (json.termSheet) {
      json.termSheet = this.termSheet?.toJSON();
    }

    return json;
  }
}
