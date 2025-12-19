export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
}

export enum SubscriptionPeriod {
  MONTH = 'month',
  YEAR = 'year',
}

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum SubscriptionPermission {
  safeNote = 'maxSafeNotes',
  investorCompany = 'maxInvestorCompanies',
  teamMember = 'maxTeamMembers',
  joinableCompany = 'maxJoinableCompanies',
  companyVerification = 'hasFreeCompanyVerification',
  legalConsultation = 'freeLegalConsultationInHours',
  sharePermissions = 'hasSharePermissions',
}
