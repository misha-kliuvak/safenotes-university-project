import {
  SubscriptionPeriod,
  SubscriptionPermission,
  SubscriptionPlan,
} from '@/modules/subscription/enums';
import { PlanPermissions } from '@/modules/subscription/types';
import { Permission } from '@/shared/enums';

export const SUBSCRIBE_PRICES = {
  [SubscriptionPeriod.MONTH]: 9.99,
  [SubscriptionPeriod.YEAR]: 99.99,
};

export const subscriptionPlans: Record<SubscriptionPlan, PlanPermissions> = {
  [SubscriptionPlan.BASIC]: {
    [SubscriptionPermission.safeNote]: 2,
    [SubscriptionPermission.investorCompany]: 1,
    [SubscriptionPermission.teamMember]: 1,
    [SubscriptionPermission.joinableCompany]: 2,
    [SubscriptionPermission.companyVerification]: false,
    [SubscriptionPermission.legalConsultation]: 0,
    [SubscriptionPermission.sharePermissions]: [Permission.VIEW],
  },
  [SubscriptionPlan.PREMIUM]: {
    [SubscriptionPermission.safeNote]: Infinity,
    [SubscriptionPermission.investorCompany]: Infinity,
    [SubscriptionPermission.teamMember]: Infinity,
    [SubscriptionPermission.joinableCompany]: Infinity,
    [SubscriptionPermission.companyVerification]: true,
    [SubscriptionPermission.legalConsultation]: 1,
    [SubscriptionPermission.sharePermissions]: Object.values(Permission),
  },
};
