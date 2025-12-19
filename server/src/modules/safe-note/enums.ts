export enum SafeNoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CANCELLED = 'cancelled',
  SIGNED = 'signed',
  DECLINED = 'declined',
}

export enum ViewSafeAs {
  SENDER = 'sender',
  RECIPIENT = 'recipient',
  TEAM_MEMBER = 'teamMember',
}

export enum SignSafeAs {
  SENDER = 'sender',
  RECIPIENT = 'recipient',
}

export enum SafeFor {
  ANGEL = 'angel',
  AGENCY = 'agency',
  ENTREPRENEUR = 'entrepreneur',
}

export enum PayAs {
  ENTREPRENEUR = 'entrepreneur',
  ANGEL = 'angel',
}

export enum SafeNoteEvents {
  UPDATE_SAFE_FOR_MFN_HOLDERS = 'UPDATE_SAFE_FOR_MFN_HOLDERS',
}
