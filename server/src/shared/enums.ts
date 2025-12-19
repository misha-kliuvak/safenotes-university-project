export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
  CREATE = 'create',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum Role {
  OWNER = 'owner',
  TEAM_MEMBER = 'teamMember',
  SAFE_RECIPIENT = 'safeRecipient',
  TERM_SHEET_RECIPIENT = 'termSheetRecipient',
}
