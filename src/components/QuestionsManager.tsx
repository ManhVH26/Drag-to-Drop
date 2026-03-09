"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Question, ValidationError, LumiJSON } from "@/lib/types";
import { DEFAULT_QUESTIONS } from "@/lib/defaultData";
import { rebuildDependsOnChain } from "@/lib/dependsOnUtils";
import { validateQuestions } from "@/lib/validation";
import { REQUIRED_QUESTION_IDS } from "@/lib/constants";
import SortableQuestionCard from "./SortableQuestionCard";
import QuestionEditModal from "./QuestionEditModal";
import QuestionAddModal from "./QuestionAddModal";
import ImportModal from "./ImportModal";

export default function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateAndValidate = useCallback((newQuestions: Question[]) => {
    const rebuilt = rebuildDependsOnChain(newQuestions);
    setQuestions(rebuilt);
    setErrors(validateQuestions(rebuilt));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      updateAndValidate(arrayMove(questions, oldIndex, newIndex));
    },
    [questions, updateAndValidate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if ((REQUIRED_QUESTION_IDS as readonly string[]).includes(id)) return;
      updateAndValidate(questions.filter((q) => q.id !== id));
    },
    [questions, updateAndValidate]
  );

  const handleSave = useCallback(
    (updated: Question) => {
      updateAndValidate(
        questions.map((q) => (q.id === updated.id ? updated : q))
      );
      setEditingQuestion(null);
    },
    [questions, updateAndValidate]
  );

  const handleAdd = useCallback(
    (newQ: Question, afterIndex: number) => {
      const newList = [...questions];
      newList.splice(afterIndex + 1, 0, newQ);
      updateAndValidate(newList);
      setShowAddModal(false);
    },
    [questions, updateAndValidate]
  );

  const handleImport = useCallback(
    (json: string): ValidationError[] => {
      try {
        const parsed: LumiJSON = JSON.parse(json);
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          return [{ ruleNumber: 0, message: "JSON must have a 'questions' array" }];
        }
        const errs = validateQuestions(parsed.questions);
        if (errs.length === 0) {
          setQuestions(parsed.questions);
          setErrors([]);
          setShowImportModal(false);
        }
        return errs;
      } catch {
        return [{ ruleNumber: 0, message: "Invalid JSON format" }];
      }
    },
    []
  );

  const exportJSON = useCallback(() => {
    return JSON.stringify({ questions }, null, 2);
  }, [questions]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(exportJSON());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [exportJSON]);

  const handleExport = useCallback(() => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumi_chat_questions.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [exportJSON]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Lumi Question Editor
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag to reorder &bull; {questions.length} questions
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Question
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          Import JSON
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          Export JSON
        </button>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            copySuccess
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {copySuccess ? "Copied!" : "Copy JSON"}
        </button>
        <button
          onClick={() => setShowExportPanel(!showExportPanel)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          {showExportPanel ? "Hide Preview" : "Preview JSON"}
        </button>
        {errors.length > 0 && (
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
          >
            {errors.length} error{errors.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Validation Errors */}
      {showErrors && errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-red-800">Validation Errors</h3>
            <button
              onClick={() => setShowErrors(false)}
              className="text-red-400 hover:text-red-600"
            >
              &times;
            </button>
          </div>
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-700">
                <span className="font-mono bg-red-100 px-1 rounded mr-1">
                  Rule {e.ruleNumber}
                </span>
                {e.questionId && (
                  <span className="font-mono text-red-500 mr-1">
                    [{e.questionId}]
                  </span>
                )}
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Preview */}
      {showExportPanel && (
        <div className="mb-4 relative">
          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-auto max-h-96 font-mono">
            {exportJSON()}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600"
          >
            {copySuccess ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Question List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {questions.map((q, index) => (
              <SortableQuestionCard
                key={q.id}
                question={q}
                index={index}
                isRequired={(REQUIRED_QUESTION_IDS as readonly string[]).includes(q.id)}
                onEdit={() => setEditingQuestion(q)}
                onDelete={() => handleDelete(q.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modals */}
      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion}
          onSave={handleSave}
          onClose={() => setEditingQuestion(null)}
        />
      )}
      {showAddModal && (
        <QuestionAddModal
          questions={questions}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showImportModal && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
