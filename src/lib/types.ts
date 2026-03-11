export type QuestionType =
  | "microcopy"
  | "single-select"
  | "multi-select"
  | "number-input";

export interface Option {
  value: string;
  key?: string;
  emoji?: string;
  microcopy?: string;
  microcopyImage?: string;
}

export interface AvailableUnit {
  unit: string;
  label: string;
  ratio: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  dependsOn: string | null;
  question?: string;
  microcopy?: string;
  showEvent?: string;
  contentEvent?: string;
  contentEventParam?: string;
  infoShowEvent?: string;
  infoContentEvent?: string;
  infoContentEventParam?: string;
  options?: Option[];
  storageUnit?: string;
  availableUnits?: AvailableUnit[];
  hardRangeMin?: number;
  hardRangeMax?: number;
  softRangeMin?: number;
  softRangeMax?: number;
  errorMessageInvalid?: string;
  errorMessageRange?: string;
  confirmMessageFormat?: string;
  bmiGotItFormat?: string;
  bmiMessageUnderweight?: string;
  bmiMessageHealthy?: string;
  bmiMessageOverweight?: string;
}

export interface ValidationError {
  ruleNumber: number;
  questionId?: string;
  message: string;
}

export interface LumiJSON {
  questions: Question[];
}

