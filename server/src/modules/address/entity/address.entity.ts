import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'address',
})
export class AddressEntity extends Model {
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
    field: 'address1',
    defaultValue: null,
  })
  address1: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'address2',
    defaultValue: null,
  })
  address2: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'city',
    defaultValue: null,
  })
  city: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'state',
    defaultValue: null,
  })
  state: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'country',
    defaultValue: null,
  })
  country: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'zip_code',
    defaultValue: null,
  })
  zipCode: string;

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
