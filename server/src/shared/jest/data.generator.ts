import { faker } from '@faker-js/faker';

import { AngelInvestorType, CompanyType } from '@/modules/company/enums';
import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';
import { SafeFor } from '@/modules/safe-note/enums';
import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';
import { Permission } from '@/shared/enums';

export class DataGenerator {
  public static readonly PREFIX = '__internal__testing__';

  public static user(additionalFields?: any) {
    return {
      email: this.PREFIX + Date.now() + faker.internet.email(),
      fullName: faker.person.fullName(),
      ...additionalFields,
    };
  }

  public static userWithPassword(additionalFields?: any) {
    return this.user({
      password: faker.internet.password(),
      ...additionalFields,
    });
  }

  public static teamMember(permission: Permission = Permission.VIEW) {
    return {
      email: this.PREFIX + faker.internet.email(),
      fullName: faker.person.fullName(),
      position: faker.word.verb(),
      permission,
    };
  }

  public static teamMemberFromUser(
    user: any,
    permission: Permission = Permission.VIEW,
  ) {
    return {
      ...user,
      position: faker.word.verb(),
      permission,
    };
  }

  public static company(
    type: CompanyType,
    investorType?: AngelInvestorType,
    teamMembers?: InviteTeamMemberDto[],
  ) {
    const isEntrepreneurCompany = type === CompanyType.ENTREPRENEUR;
    const isAngelCompany = type === CompanyType.ANGEL;
    const isCorporateAngelCompany =
      isAngelCompany && investorType === AngelInvestorType.CORPORATE;

    const entrepreneurData = {
      stateOfIncorporation: faker.location.state(),
    };

    const corporateAngelData = {
      investorType: AngelInvestorType.CORPORATE,
    };

    return {
      type,
      investorType,
      teamMembers,
      name: this.PREFIX + faker.company.name(),
      ownerPosition: faker.word.verb(),
      goal: 100,
      address: {
        state: faker.location.state(),
        address1: faker.location.streetAddress(),
      },
      ...(isEntrepreneurCompany && entrepreneurData),
      ...(isCorporateAngelCompany && corporateAngelData),
    };
  }

  public static entrepreneurCompany(teamMembers?: InviteTeamMemberDto[]) {
    return this.company(CompanyType.ENTREPRENEUR, null, teamMembers);
  }

  public static angelCompany(teamMembers?: InviteTeamMemberDto[]) {
    return this.company(
      CompanyType.ANGEL,
      AngelInvestorType.INDIVIDUAL,
      teamMembers,
    );
  }

  public static safeNote(
    senderCompanyId: string,
    data?: Partial<CreateSafeDto>,
  ) {
    return {
      senderCompanyId,
      recipientEmail: DataGenerator.user().email,
      safeFor: SafeFor.ANGEL,
      safeAmount: 10_000,
      recipientName: faker.person.fullName(),
      discountRate: 10,
      ...data,
    };
  }

  public static mfnSafeNote(
    senderCompanyId: string,
    data?: Partial<CreateSafeDto>,
  ) {
    return this.safeNote(senderCompanyId, {
      ...data,
      mfn: true,
    });
  }
}
