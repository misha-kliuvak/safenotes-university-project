import { SubscriptionPermission } from '@/modules/subscription/enums';
import { Permission } from '@/shared/enums';

export type PlanPermissions = {
  [SubscriptionPermission.safeNote]: number;
  [SubscriptionPermission.investorCompany]: number;
  [SubscriptionPermission.teamMember]: number;
  [SubscriptionPermission.joinableCompany]: number;
  [SubscriptionPermission.companyVerification]: boolean;
  [SubscriptionPermission.legalConsultation]: number;
  [SubscriptionPermission.sharePermissions]: Permission[];
};
