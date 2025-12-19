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
import { AngelInvestorType, CompanyType } from '@/modules/company/enums';

@Table({
  tableName: 'angel_company',
  timestamps: false,
})
export class AngelCompanyEntity extends Model {
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

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      AngelInvestorType.INDIVIDUAL,
      AngelInvestorType.CORPORATE,
    ),
    field: 'type',
    defaultValue: AngelInvestorType.INDIVIDUAL,
  })
  investorType: AngelInvestorType;

  @Column({
    type: DataType.VIRTUAL(DataType.STRING),
  })
  type = CompanyType.ANGEL;
}
