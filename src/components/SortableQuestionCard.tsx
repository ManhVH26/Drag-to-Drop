"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/constants";

interface Props {
  question: Question;
  index: number;
  isRequired: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SortableQuestionCard({
  question,
  index,
  isRequired,
  onEdit,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const displayText =
    question.type === "microcopy"
      ? question.microcopy
      : question.question;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow transition group ${
        isDragging ? "shadow-lg ring-2 ring-blue-300" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Index */}
      <span className="text-xs text-gray-400 w-5 text-center font-mono">
        {index + 1}
      </span>

      {/* Type Badge */}
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
          TYPE_COLORS[question.type] || "bg-gray-100 text-gray-600"
        }`}
      >
        {question.type}
      </span>

      {/* ID + Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-700">
            {question.id}
          </span>
          {isRequired && (
            <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded" title="Required - cannot delete">
              required
            </span>
          )}
        </div>
        {displayText && (
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {displayText}
          </p>
        )}
        {question.options && (
          <p className="text-xs text-gray-400 mt-0.5">
            {question.options.length} option{question.options.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
          title="Edit"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={isRequired}
          className={`p-1.5 rounded ${
            isRequired
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-red-50 text-red-400 hover:text-red-600"
          }`}
          title={isRequired ? "Cannot delete required question" : "Delete"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
