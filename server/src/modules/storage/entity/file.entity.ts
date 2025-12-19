import {
  Table,
  Column,
  AllowNull,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'file', deletedAt: false })
export class FileEntity extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
  })
  @ApiProperty({ nullable: false })
  id: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'model_classname',
  })
  @ApiProperty({ nullable: true })
  modelClassname: string;

  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'model_id',
  })
  @ApiProperty({ nullable: true })
  modelId: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'collection_name',
  })
  @ApiProperty({ nullable: true })
  collectionName?: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'absolute_path',
  })
  @ApiProperty()
  absolutePath: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'relative_path',
  })
  @ApiProperty()
  relativePath: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'original_name',
  })
  @ApiProperty()
  originalName: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'file_name',
  })
  @ApiProperty()
  fileName: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'encoding',
  })
  @ApiProperty()
  encoding: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'url',
    defaultValue: null,
  })
  @ApiProperty()
  url: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'mimetype',
  })
  @ApiProperty()
  mimetype: string;

  @AllowNull(false)
  @Column({
    type: DataType.DOUBLE,
    field: 'size',
  })
  @ApiProperty()
  size: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  @ApiProperty()
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  @ApiProperty()
  updatedAt: Date;
}
