import {
  AllowNull,
  Column,
  DataType,
  Length,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'user',
  timestamps: false,
})
export class UserPasswordEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Length({ min: 3 })
  @Column({
    type: DataType.STRING,
    field: 'password',
  })
  password: string;
}
