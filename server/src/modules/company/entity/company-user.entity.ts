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
import { UserEntity } from '@/modules/user/entity/user.entity';
import { InviteStatus, Permission, Role } from '@/shared/enums';

@Table({ tableName: 'company_user' })
export class CompanyUserEntity extends Model {
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

  @BelongsTo(() => CompanyEntity)
  company: CompanyEntity;

  @ForeignKey(() => UserEntity)
  @AllowNull(false)
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
    field: 'position',
    defaultValue: true,
  })
  position: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(Role.OWNER, Role.TEAM_MEMBER),
    field: 'role',
  })
  role: Role;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(Permission.VIEW, Permission.EDIT),
    field: 'permission',
    defaultValue: null,
  })
  permission: Permission;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      InviteStatus.PENDING,
      InviteStatus.ACCEPTED,
      InviteStatus.DECLINED,
    ),
    field: 'invite_status',
  })
  inviteStatus: InviteStatus;

  @AllowNull(false)
  @Column({
    type: DataType.NUMBER,
    field: 'notification_count',
    defaultValue: 0,
  })
  notificationCount: number;

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
