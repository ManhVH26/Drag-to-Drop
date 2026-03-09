"use client";

import { useState } from "react";
import { Question, QuestionType } from "@/lib/types";
import { QUESTION_TYPES } from "@/lib/constants";

interface Props {
  questions: Question[];
  onAdd: (q: Question, afterIndex: number) => void;
  onClose: () => void;
}

export default function QuestionAddModal({ questions, onAdd, onClose }: Props) {
  const [id, setId] = useState("");
  const [type, setType] = useState<QuestionType>("microcopy");
  const [afterIndex, setAfterIndex] = useState(questions.length - 1);
  const [error, setError] = useState("");

  const idExists = questions.some((q) => q.id === id);

  const handleCreate = () => {
    if (!id.trim()) {
      setError("ID is required");
      return;
    }
    if (idExists) {
      setError(`ID "${id}" already exists`);
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(id)) {
      setError("ID must be lowercase, start with a letter, and contain only letters, numbers, underscores");
      return;
    }

    const newQ: Question = {
      id,
      type,
      dependsOn: null,
    };

    if (type === "microcopy") {
      newQ.microcopy = "";
    } else if (type === "single-select" || type === "multi-select") {
      newQ.question = "";
      newQ.options = [{ value: "Option 1" }];
      newQ.microcopy = "";
    } else if (type === "number-input") {
      newQ.question = "";
      newQ.storageUnit = "";
      newQ.availableUnits = [];
      newQ.hardRangeMin = 0;
      newQ.hardRangeMax = 100;
    } else if (type === "info") {
      newQ.conditionalContent = {};
    }

    onAdd(newQ, afterIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Add New Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question ID</label>
            <input
              value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              placeholder="e.g. stress_level"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none ${
                idExists ? "border-red-300 bg-red-50" : ""
              }`}
            />
            {idExists && <p className="text-xs text-red-500 mt-1">This ID already exists</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insert after</label>
            <select
              value={afterIndex}
              onChange={(e) => setAfterIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value={-1}>Beginning (first position)</option>
              {questions.map((q, i) => (
                <option key={q.id} value={i}>
                  After: {q.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
