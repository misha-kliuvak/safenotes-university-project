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

import { UserEntity } from '@/modules/user/entity/user.entity';

@Table({ tableName: 'subscription' })
export class SubscriptionEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'stripe_latest_invoice_id',
    defaultValue: null,
  })
  stripeLatestInvoiceId: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'stripe_subscription_id',
    defaultValue: null,
  })
  stripeSubscriptionId?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'status',
    defaultValue: null,
  })
  status?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'start_at',
    defaultValue: null,
  })
  startAt: Date;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'end_at',
    defaultValue: null,
  })
  endAt: Date;

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
