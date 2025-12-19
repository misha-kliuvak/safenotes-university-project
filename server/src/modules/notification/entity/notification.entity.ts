import {
  AllowNull,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { NotificationType } from '@/modules/notification/enums';
import { UserEntity } from '@/modules/user/entity/user.entity';

@Table({
  tableName: 'notification',
})
export class NotificationEntity extends Model {
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

  @ForeignKey(() => CompanyEntity)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'company_id',
    defaultValue: null,
  })
  companyId: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'message',
    defaultValue: null,
  })
  message: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      NotificationType.INCOMING_SAFE_NOTE,
      NotificationType.TEAM_MEMBER_REQUEST,
      NotificationType.SIGNED_SAFE_NOTE,
      NotificationType.PAYED_SAFE_NOTE,
    ),
    field: 'type',
  })
  type: NotificationType;

  @AllowNull(true)
  @Column({
    type: DataType.JSON,
    field: 'payload',
    defaultValue: null,
  })
  payload: string;

  @AllowNull(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'read',
    defaultValue: false,
  })
  read: boolean;

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
