export interface Category {
  emoji: string;
  label: string;
}

export interface ScreenObject {
  type: string;
  id?: string;
  image_url?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  button?: string;
  description?: string;
  box_title?: string;
  box_subtitle?: string;
  categories?: Category[];
}

// A screen item in the JSON can be either a plain string or an object
export type ScreenItem = string | ScreenObject;

// Normalized screen for internal use (always has type and a unique key)
export interface NormalizedScreen {
  key: string; // unique key for drag-to-drop (type or id for generic)
  raw: ScreenItem;
  type: string;
  isObject: boolean;
}

export interface OBValidationError {
  ruleNumber: number;
  screenId?: string;
  message: string;
}
