export type ReceiptStatus = 'PENDING_REVIEW' | 'NEEDS_REVIEW';

export type ReceiptLineStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'IGNORED';

export interface ReceiptOcrResponse {
  receiptId: number;
  status: ReceiptStatus;
  rawText: string;
  originalFileName: string;
  ocrProvider: string;
}

export interface ReceiptLine {
  id: number;
  receiptId: number;
  rawName: string;
  rawLine: string;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  lineTotal?: number | null;
  confidence: number;
  needsReview: boolean;
  status: ReceiptLineStatus;
}

export interface ReceiptParseResponse {
  receiptId: number;
  status: ReceiptStatus;
  rawText?: string | null;
  lines: ReceiptLine[];
}
