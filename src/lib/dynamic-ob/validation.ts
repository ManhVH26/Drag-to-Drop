import { ScreenItem, ScreenObject, OBValidationError } from "./types";
import { REQUIRED_SCREENS, ORDER_CONSTRAINTS } from "./constants";

function getScreenType(item: ScreenItem): string {
  return typeof item === "string" ? item : item.type;
}

function getScreenId(item: ScreenItem): string {
  if (typeof item === "string") return item;
  return (item as ScreenObject).id || item.type;
}

export function validateScreens(screens: ScreenItem[]): OBValidationError[] {
  const errors: OBValidationError[] = [];

  // Rule 1: Non-empty
  if (screens.length === 0) {
    errors.push({ ruleNumber: 1, message: "Danh sach man hinh khong duoc rong" });
    return errors;
  }

  // Rule 2: Required screens present
  const types = screens.map(getScreenType);
  for (const req of REQUIRED_SCREENS) {
    if (!types.includes(req)) {
      errors.push({
        ruleNumber: 2,
        screenId: req,
        message: `Thieu man hinh bat buoc "${req}"`,
      });
    }
  }

  // Rule 2b: "welcome" must be at position 0
  if (types.includes("welcome") && types[0] !== "welcome") {
    errors.push({
      ruleNumber: 2,
      screenId: "welcome",
      message: `"welcome" phai dung o vi tri dau tien (vi tri 0)`,
    });
  }

  // Rule 2c: "paywall" must be at last position
  if (types.includes("paywall") && types[types.length - 1] !== "paywall") {
    errors.push({
      ruleNumber: 2,
      screenId: "paywall",
      message: `"paywall" phai dung o vi tri cuoi cung`,
    });
  }

  // Rule 3: Order constraints
  for (const [before, after] of ORDER_CONSTRAINTS) {
    const beforeIdx = types.indexOf(before);
    const afterIdx = types.indexOf(after);
    if (beforeIdx !== -1 && afterIdx !== -1 && beforeIdx > afterIdx) {
      errors.push({
        ruleNumber: 3,
        message: `"${before}" phai dung truoc "${after}"`,
      });
    }
  }

  // Rule 4: Unique IDs for generic screens
  const ids: string[] = [];
  for (const screen of screens) {
    const id = getScreenId(screen);
    if (ids.includes(id)) {
      errors.push({
        ruleNumber: 4,
        screenId: id,
        message: `Trung ID "${id}"`,
      });
    }
    ids.push(id);
  }

  // Rule 5: Generic screens must have id
  for (const screen of screens) {
    if (typeof screen === "object" && screen.type === "generic" && !screen.id) {
      errors.push({
        ruleNumber: 5,
        screenId: "generic",
        message: `Man hinh generic phai co truong "id" duy nhat`,
      });
    }
  }

  return errors;
}
