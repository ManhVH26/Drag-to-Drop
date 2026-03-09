export const REQUIRED_QUESTION_IDS = [
  "age",
  "gender",
  "motivation",
  "avoid_body_parts",
  "workout_type",
  "activity_level",
  "fitness_level",
  "height",
  "current_weight",
  "target_weight",
  "aging_perception",
  "reversible_info",
  "main_goal",
] as const;

export const QUESTION_TYPES = [
  "microcopy",
  "single-select",
  "multi-select",
  "number-input",
  "info",
] as const;

export const NON_EDITABLE_FIELDS = [
  "id",
  "type",
  "dependsOn",
  "showEvent",
  "contentEvent",
  "contentEventParam",
] as const;

export const TYPE_COLORS: Record<string, string> = {
  microcopy: "bg-gray-200 text-gray-700",
  "single-select": "bg-blue-100 text-blue-700",
  "multi-select": "bg-purple-100 text-purple-700",
  "number-input": "bg-green-100 text-green-700",
  info: "bg-amber-100 text-amber-700",
};

export const MEASUREMENT_IDS = ["height", "current_weight", "target_weight"];
