import { Question, ValidationError } from "./types";
import { REQUIRED_QUESTION_IDS, QUESTION_TYPES, MEASUREMENT_IDS } from "./constants";

export function validateQuestions(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 1: Empty list
  if (questions.length === 0) {
    errors.push({ ruleNumber: 1, message: "Danh sách câu hỏi không được rỗng" });
    return errors;
  }

  // Rule 2: Duplicate id
  const ids = questions.map((q) => q.id);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      errors.push({ ruleNumber: 2, questionId: id, message: `Trùng id "${id}"` });
    }
    seen.add(id);
  }

  // Rule 3: Missing required questions
  for (const reqId of REQUIRED_QUESTION_IDS) {
    if (!ids.includes(reqId)) {
      errors.push({ ruleNumber: 3, questionId: reqId, message: `Thiếu câu bắt buộc "${reqId}"` });
    }
  }

  // Rule 4: Invalid type
  for (const q of questions) {
    if (!(QUESTION_TYPES as readonly string[]).includes(q.type)) {
      errors.push({ ruleNumber: 4, questionId: q.id, message: `Type không hợp lệ: "${q.type}"` });
    }
  }

  // Rule 5: dependsOn references non-existent id
  const idSet = new Set(ids);
  for (const q of questions) {
    if (q.dependsOn !== null && !idSet.has(q.dependsOn)) {
      errors.push({
        ruleNumber: 5,
        questionId: q.id,
        message: `dependsOn trỏ tới "${q.dependsOn}" không tồn tại`,
      });
    }
  }

  // Rule 6: Circular dependsOn
  const depMap = new Map(questions.map((q) => [q.id, q.dependsOn]));
  for (const q of questions) {
    const visited = new Set<string>();
    let current: string | null = q.id;
    while (current) {
      if (visited.has(current)) {
        errors.push({
          ruleNumber: 6,
          questionId: q.id,
          message: `Phát hiện vòng lặp dependsOn tại "${q.id}"`,
        });
        break;
      }
      visited.add(current);
      current = depMap.get(current) ?? null;
    }
  }

  // Rule 7: Select questions missing options
  for (const q of questions) {
    if ((q.type === "single-select" || q.type === "multi-select") && (!q.options || q.options.length === 0)) {
      errors.push({
        ruleNumber: 7,
        questionId: q.id,
        message: `Câu "${q.id}" (${q.type}) cần ít nhất 1 option`,
      });
    }
  }

  // Rule 8: Measurement questions missing units
  for (const q of questions) {
    if (MEASUREMENT_IDS.includes(q.id)) {
      if (!q.storageUnit || !q.availableUnits || q.availableUnits.length === 0) {
        errors.push({
          ruleNumber: 8,
          questionId: q.id,
          message: `Câu "${q.id}" cần có storageUnit và availableUnits`,
        });
      }
    }
  }

  // Rule 9: ratio = 0
  for (const q of questions) {
    if (q.availableUnits) {
      for (const u of q.availableUnits) {
        if (u.ratio === 0) {
          errors.push({
            ruleNumber: 9,
            questionId: q.id,
            message: `Unit "${u.unit}" trong "${q.id}" có ratio = 0 (gây chia cho 0)`,
          });
        }
      }
    }
  }

  // Rule 10: hardRangeMin > hardRangeMax
  for (const q of questions) {
    if (q.hardRangeMin !== undefined && q.hardRangeMax !== undefined && q.hardRangeMin > q.hardRangeMax) {
      errors.push({
        ruleNumber: 10,
        questionId: q.id,
        message: `hardRangeMin (${q.hardRangeMin}) > hardRangeMax (${q.hardRangeMax})`,
      });
    }
  }

  // Rule 11: softRange outside hardRange
  for (const q of questions) {
    if (q.softRangeMin !== undefined && q.hardRangeMin !== undefined && q.softRangeMin < q.hardRangeMin) {
      errors.push({
        ruleNumber: 11,
        questionId: q.id,
        message: `softRangeMin (${q.softRangeMin}) < hardRangeMin (${q.hardRangeMin})`,
      });
    }
    if (q.softRangeMax !== undefined && q.hardRangeMax !== undefined && q.softRangeMax > q.hardRangeMax) {
      errors.push({
        ruleNumber: 11,
        questionId: q.id,
        message: `softRangeMax (${q.softRangeMax}) > hardRangeMax (${q.hardRangeMax})`,
      });
    }
  }

  // Rule 12: conditionalContent keys mismatch
  const agingQ = questions.find((q) => q.id === "aging_perception");
  const reversibleQ = questions.find((q) => q.id === "reversible_info");
  if (agingQ && reversibleQ && reversibleQ.conditionalContent && agingQ.options) {
    const optionKeys = new Set(agingQ.options.map((o) => o.key).filter(Boolean));
    const contentKeys = new Set(Object.keys(reversibleQ.conditionalContent));
    for (const k of optionKeys) {
      if (!contentKeys.has(k!)) {
        errors.push({
          ruleNumber: 12,
          questionId: "reversible_info",
          message: `conditionalContent thiếu key "${k}" (từ aging_perception options)`,
        });
      }
    }
    for (const k of contentKeys) {
      if (!optionKeys.has(k)) {
        errors.push({
          ruleNumber: 12,
          questionId: "reversible_info",
          message: `conditionalContent có key "${k}" nhưng không có trong aging_perception options`,
        });
      }
    }
  }

  return errors;
}
