import { CreateAngelCompanyDto } from '@/modules/company/dto/create-angel-company.dto';
import { CreateEntrepreneurCompanyDto } from '@/modules/company/dto/create-entrepreneur-company.dto';
import { UpdateAngelCompanyDto } from '@/modules/company/dto/update-angel-company.dto';
import { UpdateEntrepreneurCompanyDto } from '@/modules/company/dto/update-entrepreneur-company.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';

export interface CompanyOwner
  extends Pick<
    UserEntity,
    'id' | 'fullName' | 'email' | 'image' | 'emailVerified'
  > {
  position: string;
}

export type CreateCompanyDto =
  | CreateAngelCompanyDto
  | CreateEntrepreneurCompanyDto;

export type UpdateCompanyDto =
  | UpdateAngelCompanyDto
  | UpdateEntrepreneurCompanyDto;

export interface CompanySummary {
  unpaidCount: number;
  totalSafeCount: number;
  numberOfInvestedCompanies: number;
  paidAmount: number;
  unpaidAmount: number;
  signedCount: number;
}
