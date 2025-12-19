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

@Table({ tableName: 'company_payment' })
export class CompanyPaymentEntity extends Model {
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
    field: 'company_id',
  })
  companyId: string;

  @ForeignKey(() => PaymentEntity)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'payment_id',
  })
  paymentId: string;

  @BelongsTo(() => PaymentEntity)
  payment: PaymentEntity;

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
}
