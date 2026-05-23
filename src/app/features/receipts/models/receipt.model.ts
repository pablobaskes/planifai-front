export type ReceiptStatus = 'PENDING_REVIEW';

export interface ReceiptOcrResponse {
  receiptId: number;
  status: ReceiptStatus;
  rawText: string;
  originalFileName: string;
  ocrProvider: string;
}
