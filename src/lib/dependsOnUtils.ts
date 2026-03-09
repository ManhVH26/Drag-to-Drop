import { Question } from "./types";

export function rebuildDependsOnChain(questions: Question[]): Question[] {
  return questions.map((q, i) => ({
    ...q,
    dependsOn: i === 0 ? null : questions[i - 1].id,
  }));
}
