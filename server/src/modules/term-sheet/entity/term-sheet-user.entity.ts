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
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { SafeProgress, TermSheetStatus } from '@/modules/term-sheet/enums';
import { UserEntity } from '@/modules/user/entity/user.entity';

@Table({ tableName: 'term_sheet_user' })
export class TermSheetUserEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => TermSheetEntity)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'term_sheet_id',
  })
  termSheetId: string;

  @BelongsTo(() => TermSheetEntity)
  termSheet: TermSheetEntity;

  @ForeignKey(() => UserEntity)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @ForeignKey(() => CompanyEntity)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'user_company_id',
    defaultValue: null,
  })
  userCompanyId: string;

  @BelongsTo(() => CompanyEntity)
  userCompany: CompanyEntity;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(
      TermSheetStatus.ACCEPTED,
      TermSheetStatus.REJECTED,
      TermSheetStatus.PENDING,
    ),
    field: 'status',
    defaultValue: TermSheetStatus.PENDING,
  })
  status: TermSheetStatus;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'comment',
    defaultValue: null,
  })
  comment: string;

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

  @Column({
    type: DataType.VIRTUAL(),
    defaultValue: SafeProgress.AWAITING,
  })
  safeProgress: SafeProgress = SafeProgress.AWAITING;

  public toJSON() {
    const json = super.toJSON();

    if (json.userCompany) {
      json.userCompany = this.userCompany?.toJSON();
    }

    return json;
  }
}
