import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'token_blacklist',
  updatedAt: false,
})
export class TokenBlacklistEntity extends Model {
  @AllowNull(false)
  @Unique(true)
  @PrimaryKey
  @Column({
    type: DataType.TEXT,
    field: 'token',
    unique: true,
  })
  token: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt: Date;
}
