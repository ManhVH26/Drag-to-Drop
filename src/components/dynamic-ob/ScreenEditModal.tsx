"use client";

import { useState } from "react";
import { ScreenItem, ScreenObject, Category } from "@/lib/dynamic-ob/types";
import { SCREEN_FIELDS } from "@/lib/dynamic-ob/constants";

interface Props {
  screen: ScreenItem;
  screenType: string;
  onSave: (updated: ScreenItem) => void;
  onClose: () => void;
}

export default function ScreenEditModal({ screen, screenType, onSave, onClose }: Props) {
  const obj = typeof screen === "object" ? screen : { type: screenType };
  const [draft, setDraft] = useState<ScreenObject>({ ...obj });

  const set = (key: string, val: string) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const fields = SCREEN_FIELDS[screenType] || [];
  const hasCategories = fields.includes("categories");
  const textFields = fields.filter((f) => f !== "categories");

  const updateCategory = (idx: number, updates: Partial<Category>) => {
    const cats = [...(draft.categories || [])];
    cats[idx] = { ...cats[idx], ...updates };
    setDraft((d) => ({ ...d, categories: cats }));
  };


  const handleSave = () => {
    // Clean empty string fields
    const cleaned: ScreenObject = { type: draft.type };
    if (draft.id) cleaned.id = draft.id;
    for (const field of textFields) {
      if (field === "id") continue;
      const val = (draft as unknown as Record<string, unknown>)[field];
      if (val !== undefined && val !== "") {
        (cleaned as unknown as Record<string, unknown>)[field] = val;
      }
    }
    if (hasCategories && draft.categories && draft.categories.length > 0) {
      cleaned.categories = draft.categories;
    }
    onSave(cleaned);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold">Edit: {screenType}</h2>
            <span className="text-xs text-gray-400">
              {screenType === "generic" ? `id: ${draft.id || "(none)"}` : "fixed screen"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Type (locked) */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              type <span className="text-red-300">locked</span>
            </label>
            <input
              value={draft.type}
              disabled
              className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
            />
          </div>

          {/* Text fields */}
          {textFields.map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {field}
                {field === "id" && screenType === "generic" && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {field === "title" || field === "subtitle" || field === "bottom_text" || field === "description" ? (
                <textarea
                  value={((draft as unknown as Record<string, unknown>)[field] as string) || ""}
                  onChange={(e) => set(field, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
              ) : (
                <input
                  value={((draft as unknown as Record<string, unknown>)[field] as string) || ""}
                  onChange={(e) => set(field, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
              )}
            </div>
          ))}

          {/* Categories (key_aspects) */}
          {hasCategories && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Categories</label>
              <div className="space-y-2">
                {(draft.categories || []).map((cat, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="w-16">
                      <label className="block text-xs text-gray-500">emoji</label>
                      <input
                        value={cat.emoji}
                        onChange={(e) => updateCategory(i, { emoji: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded text-sm text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">label</label>
                      <input
                        value={cat.label}
                        onChange={(e) => updateCategory(i, { label: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
