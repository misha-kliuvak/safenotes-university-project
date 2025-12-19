import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { PaymentProvider, PaymentStatus } from '@/modules/payment/enums';

@Table({
  tableName: 'payment',
  updatedAt: false,
  deletedAt: false,
})
export class PaymentEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'transaction_id',
    defaultValue: null,
  })
  transactionId: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'payment_intent_id',
    defaultValue: null,
  })
  paymentIntentId: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'receipt_url',
    defaultValue: null,
  })
  receiptUrl: string;

  @AllowNull(false)
  @Column({
    type: DataType.DOUBLE,
    field: 'amount',
  })
  amount: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'currency',
    defaultValue: null,
  })
  currency: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'payment_method_type',
    defaultValue: null,
  })
  paymentMethodType: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'payment_method_id',
    defaultValue: null,
  })
  paymentMethodId: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      PaymentStatus.CREATED,
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      PaymentStatus.UNPAID,
    ),
    field: 'status',
    defaultValue: PaymentStatus.CREATED,
  })
  status: PaymentStatus;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'provider',
  })
  provider: PaymentProvider;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt: Date;
}
