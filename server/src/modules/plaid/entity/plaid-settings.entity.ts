import {
  AllowNull,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { PlaidSettingsKey } from '@/modules/plaid/enums';

@Table({
  tableName: 'plaid_settings',
  updatedAt: false,
  createdAt: false,
})
export class PlaidSettingsEntity extends Model {
  @AllowNull(false)
  @Unique(true)
  @PrimaryKey
  @Column({
    type: DataType.ENUM(PlaidSettingsKey.LAST_EVENT_ID),
    field: 'key',
    unique: true,
  })
  key: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'value',
    defaultValue: 0,
  })
  value: string;
}
