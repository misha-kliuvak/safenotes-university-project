enum PlaidWebhookType {
  TRANSFER = 'TRANSFER',
}

enum PlaidTransferWebhookCode {
  TRANSFER_EVENTS_UPDATE = 'TRANSFER_EVENTS_UPDATE',
  RECURRING_NEW_TRANSFER = 'RECURRING_NEW_TRANSFER',
  RECURRING_TRANSFER_SKIPPED = 'RECURRING_TRANSFER_SKIPPED',
  RECURRING_CANCELLED = 'RECURRING_CANCELLED',
}

interface BasePlaidWebhook {
  webhook_type: PlaidWebhookType;
  webhook_code: PlaidTransferWebhookCode;
}

interface TransferWebhook extends BasePlaidWebhook {
  webhook_type: PlaidWebhookType.TRANSFER;
  webhook_code: PlaidTransferWebhookCode;
}

export {
  PlaidWebhookType,
  BasePlaidWebhook,
  TransferWebhook,
  PlaidTransferWebhookCode,
};
