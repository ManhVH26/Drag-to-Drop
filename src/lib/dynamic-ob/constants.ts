export const REQUIRED_SCREENS = ["lumi", "loading_habit", "paywall"] as const;

// [A, B] means A must come before B
export const ORDER_CONSTRAINTS: [string, string][] = [
  ["lumi", "loading_habit"],
  ["lumi", "goal_plan"],
  ["lumi", "get_my_plan"],
  ["loading_habit", "goal_plan"],
  ["loading_habit", "get_my_plan"],
];

export const FIXED_SCREEN_TYPES = [
  "welcome",
  "key_aspects",
  "lumi",
  "loading_habit",
  "goal_plan",
  "get_my_plan",
  "trial_1",
  "trial_2",
  "trial_3",
  "paywall",
] as const;

export const ALL_SCREEN_TYPES = [...FIXED_SCREEN_TYPES, "generic"] as const;

export const SCREEN_TYPE_COLORS: Record<string, string> = {
  welcome: "bg-indigo-100 text-indigo-700",
  key_aspects: "bg-teal-100 text-teal-700",
  lumi: "bg-blue-100 text-blue-700",
  loading_habit: "bg-amber-100 text-amber-700",
  goal_plan: "bg-green-100 text-green-700",
  get_my_plan: "bg-emerald-100 text-emerald-700",
  trial_1: "bg-purple-100 text-purple-700",
  trial_2: "bg-purple-100 text-purple-700",
  trial_3: "bg-purple-100 text-purple-700",
  paywall: "bg-red-100 text-red-700",
  generic: "bg-gray-200 text-gray-700",
};

// Fields available per screen type for content override
export const SCREEN_FIELDS: Record<string, string[]> = {
  welcome: ["image_url", "title", "highlight", "subtitle"],
  key_aspects: ["image_url", "title", "button", "box_title", "box_subtitle", "categories"],
  trial_1: ["image_url", "title", "highlight", "subtitle", "button"],
  trial_2: ["image_url", "title", "highlight", "subtitle", "button"],
  trial_3: ["image_url", "title", "highlight", "subtitle", "button", "description"],
  generic: ["id", "style", "title", "subtitle", "highlight", "button", "image_url", "description"],
};
