import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { CompanyType } from '@/modules/company/enums';

@Table({
  tableName: 'entrepreneur_company',
  timestamps: false,
})
export class EntrepreneurCompanyEntity extends Model {
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
    field: 'parent_id',
  })
  parentId: string;

  @BelongsTo(() => CompanyEntity)
  parent: CompanyEntity;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'state_of_incorporation',
    defaultValue: null,
  })
  stateOfIncorporation: string;

  @Column({
    type: DataType.VIRTUAL(DataType.STRING),
  })
  type = CompanyType.ENTREPRENEUR;
}
