"use client";

import { useState } from "react";
import { ScreenItem, NormalizedScreen } from "@/lib/dynamic-ob/types";
import { ALL_SCREEN_TYPES } from "@/lib/dynamic-ob/constants";

interface Props {
  screens: NormalizedScreen[];
  onAdd: (item: ScreenItem, afterIndex: number) => void;
  onClose: () => void;
}

export default function ScreenAddModal({ screens, onAdd, onClose }: Props) {
  const [type, setType] = useState<string>("generic");
  const [id, setId] = useState("");
  const [afterIndex, setAfterIndex] = useState(screens.length - 1);
  const [useObject, setUseObject] = useState(true);
  const [error, setError] = useState("");

  const isGeneric = type === "generic";
  const existingTypes = screens.map((s) => s.type);

  const handleCreate = () => {
    if (isGeneric && !id.trim()) {
      setError("Generic screen requires a unique ID");
      return;
    }
    if (isGeneric && screens.some((s) => s.key === id)) {
      setError(`ID "${id}" already exists`);
      return;
    }

    let item: ScreenItem;
    if (useObject || isGeneric) {
      item = { type };
      if (isGeneric) {
        item = { type, id, title: "", subtitle: "", button: "" };
      }
    } else {
      // String-only screens (fixed types without content override)
      if (existingTypes.includes(type) && !isGeneric) {
        setError(`Screen "${type}" already exists. Use generic type for duplicates.`);
        return;
      }
      item = type;
    }

    onAdd(item, afterIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Add Screen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Screen Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setError("");
                if (e.target.value === "generic") setUseObject(true);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              {ALL_SCREEN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {isGeneric && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Screen ID <span className="text-red-500">*</span>
              </label>
              <input
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError("");
                }}
                placeholder="e.g. promo_banner"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
          )}

          {!isGeneric && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useObject"
                checked={useObject}
                onChange={(e) => setUseObject(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useObject" className="text-sm text-gray-700">
                Add as object (with content override)
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insert after</label>
            <select
              value={afterIndex}
              onChange={(e) => setAfterIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value={-1}>Beginning (first position)</option>
              {screens.map((s, i) => (
                <option key={s.key} value={i}>
                  After: {s.key}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
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
