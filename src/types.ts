/**
 * Types and Interfaces for The Accountant's Veil Simulation
 */

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type ActiveTab = "investigation" | "sheets" | "casefile" | "instructions";

export type SheetName = "ledger" | "bank" | "employee";

export interface ExcelCell {
  id: string; // e.g. "B6"
  row: number;
  col: string; // e.g. "A", "B", "C"
  label: string; // e.g. "Date"
  value: string | number;
  formula?: string;
  isHeader?: boolean;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
}

export interface EvidenceState {
  hasFoundBrokenSum: boolean;
  hasFoundMNTransaction: boolean;
  hasMatchedBankAccount: boolean;
}

export interface AuditCaseState {
  currentStress: number; // 0 to 100
  unlockedSmokingGuns: string[]; // ["mismatch_sum", "mn_payment", "bank_match"]
  caseReportSubmitted: boolean;
  reportingScore: number; // 0 - 100
  reportComments: string;
}
