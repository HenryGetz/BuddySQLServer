export interface SqlResult {
  columns: string[];
  values: any[][];
}

export interface SqlError {
  message: string;
  code?: string;
}

export type CompatibilityStatus = "success" | "caveat" | "failed";

export interface CompatibilityFeedback {
  status: CompatibilityStatus;
  message: string;
  hints?: string[];
}

export interface DatabaseState {
  db: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface QueryResult {
  results: SqlResult[] | null;
  error: SqlError | null;
  executionTime?: number;
  compatibility?: CompatibilityFeedback;
}
