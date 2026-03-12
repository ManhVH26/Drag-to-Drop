"use client";

import { useState, useCallback, useMemo } from "react";
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
import { ScreenItem, ScreenObject, OBValidationError, NormalizedScreen } from "@/lib/dynamic-ob/types";
import { DEFAULT_SCREENS } from "@/lib/dynamic-ob/defaultData";
import { validateScreens } from "@/lib/dynamic-ob/validation";
import { REQUIRED_SCREENS } from "@/lib/dynamic-ob/constants";
import SortableScreenCard from "./SortableScreenCard";
import ScreenEditModal from "./ScreenEditModal";
import ScreenAddModal from "./ScreenAddModal";
import OBImportModal from "./OBImportModal";

function getScreenType(item: ScreenItem): string {
  return typeof item === "string" ? item : item.type;
}

function getScreenKey(item: ScreenItem, index: number): string {
  if (typeof item === "string") return item;
  const obj = item as ScreenObject;
  return obj.id || `${obj.type}_${index}`;
}

function normalizeScreens(screens: ScreenItem[]): NormalizedScreen[] {
  return screens.map((item, index) => ({
    key: getScreenKey(item, index),
    raw: item,
    type: getScreenType(item),
    isObject: typeof item === "object",
  }));
}

export default function ScreensManager() {
  const [screens, setScreens] = useState<ScreenItem[]>(DEFAULT_SCREENS);
  const [errors, setErrors] = useState<OBValidationError[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const normalized = useMemo(() => normalizeScreens(screens), [screens]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateAndValidate = useCallback((newScreens: ScreenItem[]) => {
    setScreens(newScreens);
    setErrors(validateScreens(newScreens));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = normalized.findIndex((s) => s.key === active.id);
      const newIndex = normalized.findIndex((s) => s.key === over.id);
      updateAndValidate(arrayMove(screens, oldIndex, newIndex));
    },
    [screens, normalized, updateAndValidate]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const type = getScreenType(screens[index]);
      if ((REQUIRED_SCREENS as readonly string[]).includes(type)) return;
      updateAndValidate(screens.filter((_, i) => i !== index));
    },
    [screens, updateAndValidate]
  );

  const handleSave = useCallback(
    (index: number, updated: ScreenItem) => {
      const newScreens = [...screens];
      newScreens[index] = updated;
      updateAndValidate(newScreens);
      setEditingIndex(null);
    },
    [screens, updateAndValidate]
  );

  const handleAdd = useCallback(
    (item: ScreenItem, afterIndex: number) => {
      const newList = [...screens];
      newList.splice(afterIndex + 1, 0, item);
      updateAndValidate(newList);
      setShowAddModal(false);
    },
    [screens, updateAndValidate]
  );

  const handleImport = useCallback(
    (json: string): OBValidationError[] => {
      try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
          return [{ ruleNumber: 0, message: "JSON phai la mot mang (array)" }];
        }
        const errs = validateScreens(parsed);
        if (errs.length === 0) {
          setScreens(parsed);
          setErrors([]);
          setShowImportModal(false);
        }
        return errs;
      } catch {
        return [{ ruleNumber: 0, message: "JSON khong hop le" }];
      }
    },
    []
  );

  const exportJSON = useCallback(() => {
    return JSON.stringify(screens, null, 2);
  }, [screens]);

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
    a.download = "ob_screen_order.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [exportJSON]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dynamic Onboarding Editor
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag to reorder &bull; {screens.length} screens
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Screen
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
                {e.screenId && (
                  <span className="font-mono text-red-500 mr-1">
                    [{e.screenId}]
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

      {/* Screen List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={normalized.map((s) => s.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {normalized.map((s, index) => (
              <SortableScreenCard
                key={s.key}
                screen={s}
                index={index}
                isRequired={(REQUIRED_SCREENS as readonly string[]).includes(s.type)}
                onEdit={() => setEditingIndex(index)}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modals */}
      {editingIndex !== null && (
        <ScreenEditModal
          screen={screens[editingIndex]}
          screenType={getScreenType(screens[editingIndex])}
          onSave={(updated) => handleSave(editingIndex, updated)}
          onClose={() => setEditingIndex(null)}
        />
      )}
      {showAddModal && (
        <ScreenAddModal
          screens={normalized}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showImportModal && (
        <OBImportModal
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
