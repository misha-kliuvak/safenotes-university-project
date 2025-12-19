import { SetMetadata } from '@nestjs/common';

import { SubscriptionPermission } from '@/modules/subscription/enums';
import { Permission } from '@/shared/enums';

export const SUBSCRIPTION_KEY = 'subscription_key';
export const Subscription = (
  subscriptionPermission: SubscriptionPermission,
  permission: Permission,
) => SetMetadata(SUBSCRIPTION_KEY, { subscriptionPermission, permission });
