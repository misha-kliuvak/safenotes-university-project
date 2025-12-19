export interface IncomingSafeNotePayload {
  safeNoteId: string;
  senderName: string;
  senderImage: string;
  companyName: string;
  companyImage: string;
}

export interface TeamMemberRequestPayload {
  inviterName: string;
  inviterImage: string;
  companyName: string;
  companyImage: string;
  companyId: string;
}

export interface SignedSafeNotePayload {
  safeNoteId: string;
  senderName: string;
  senderImage: string;
  companyName: string;
  companyImage: string;
}

export interface PayedSafeNotePayload {
  safeNoteId: string;
  senderName: string;
  senderImage: string;
  companyName: string;
  companyImage: string;
  amount: number;
}
