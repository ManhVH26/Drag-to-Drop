"use client";

import { useState } from "react";
import { Question, Option, AvailableUnit } from "@/lib/types";

interface Props {
  question: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
}

export default function QuestionEditModal({ question, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Question>({ ...question });

  const set = <K extends keyof Question>(key: K, val: Question[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const updateOption = (idx: number, updates: Partial<Option>) => {
    const opts = [...(draft.options || [])];
    opts[idx] = { ...opts[idx], ...updates };
    set("options", opts);
  };

  const addOption = () => {
    set("options", [...(draft.options || []), { value: "" }]);
  };

  const removeOption = (idx: number) => {
    set("options", (draft.options || []).filter((_, i) => i !== idx));
  };

  const updateUnit = (idx: number, updates: Partial<AvailableUnit>) => {
    const units = [...(draft.availableUnits || [])];
    units[idx] = { ...units[idx], ...updates };
    set("availableUnits", units);
  };

  const addUnit = () => {
    set("availableUnits", [
      ...(draft.availableUnits || []),
      { unit: "", label: "", ratio: 1 },
    ]);
  };

  const removeUnit = (idx: number) => {
    set("availableUnits", (draft.availableUnits || []).filter((_, i) => i !== idx));
  };

  const isSelect = draft.type === "single-select" || draft.type === "multi-select";
  const isNumberInput = draft.type === "number-input";

  const lockedFields: (keyof Question)[] = [
    "id", "type", "dependsOn", "showEvent", "contentEvent", "contentEventParam",
    "infoShowEvent", "infoContentEvent", "infoContentEventParam",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold">Edit: {draft.id}</h2>
            <span className="text-xs text-gray-400">{draft.type}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Non-editable fields */}
          <div className="grid grid-cols-2 gap-3">
            {lockedFields.map((field) => {
              const val = draft[field];
              if (val === undefined) return null;
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {field} <span className="text-red-300">locked</span>
                  </label>
                  <input
                    value={String(val ?? "")}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              );
            })}
          </div>

          {/* Question text */}
          {draft.type !== "microcopy" && (
            <Field label="question" value={draft.question || ""} onChange={(v) => set("question", v)} />
          )}

          {/* Microcopy */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">microcopy</label>
            <textarea
              value={draft.microcopy || ""}
              onChange={(e) => set("microcopy", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Options for select types */}
          {isSelect && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Options</label>
                <button onClick={addOption} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  + Add Option
                </button>
              </div>
              <div className="space-y-3">
                {(draft.options || []).map((opt, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">Option {i + 1}</span>
                      <button
                        onClick={() => removeOption(i)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">value</label>
                        <input
                          value={opt.value}
                          onChange={(e) => updateOption(i, { value: e.target.value })}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          key <span className="text-amber-500" title="Edit with caution">&#x26A0;</span>
                        </label>
                        <input
                          value={opt.key || ""}
                          onChange={(e) => updateOption(i, { key: e.target.value || undefined })}
                          className="w-full px-2 py-1.5 border rounded text-sm border-amber-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">emoji</label>
                        <input
                          value={opt.emoji || ""}
                          onChange={(e) => updateOption(i, { emoji: e.target.value || undefined })}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">microcopy</label>
                        <input
                          value={opt.microcopy || ""}
                          onChange={(e) => updateOption(i, { microcopy: e.target.value || undefined })}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">microcopyImage</label>
                      <input
                        value={opt.microcopyImage || ""}
                        onChange={(e) => updateOption(i, { microcopyImage: e.target.value || undefined })}
                        placeholder="e.g. img_ob_reversible"
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Number Input Fields */}
          {isNumberInput && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                Number Input Settings <span className="text-amber-500">&#x26A0; Edit with caution</span>
              </h3>
              <div>
                <label className="block text-xs text-gray-500">storageUnit</label>
                <input
                  value={draft.storageUnit || ""}
                  onChange={(e) => set("storageUnit", e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-sm border-amber-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumField label="hardRangeMin" value={draft.hardRangeMin} onChange={(v) => set("hardRangeMin", v)} warn />
                <NumField label="hardRangeMax" value={draft.hardRangeMax} onChange={(v) => set("hardRangeMax", v)} warn />
                <NumField label="softRangeMin" value={draft.softRangeMin} onChange={(v) => set("softRangeMin", v)} warn />
                <NumField label="softRangeMax" value={draft.softRangeMax} onChange={(v) => set("softRangeMax", v)} warn />
              </div>
              <Field label="errorMessageInvalid" value={draft.errorMessageInvalid || ""} onChange={(v) => set("errorMessageInvalid", v)} />
              <Field label="errorMessageRange" value={draft.errorMessageRange || ""} onChange={(v) => set("errorMessageRange", v)} />
              <Field label="confirmMessageFormat" value={draft.confirmMessageFormat || ""} onChange={(v) => set("confirmMessageFormat", v)} />

              {draft.id === "target_weight" && (
                <>
                  <Field label="bmiGotItFormat" value={draft.bmiGotItFormat || ""} onChange={(v) => set("bmiGotItFormat", v)} />
                  <Field label="bmiMessageUnderweight" value={draft.bmiMessageUnderweight || ""} onChange={(v) => set("bmiMessageUnderweight", v)} />
                  <Field label="bmiMessageHealthy" value={draft.bmiMessageHealthy || ""} onChange={(v) => set("bmiMessageHealthy", v)} />
                  <Field label="bmiMessageOverweight" value={draft.bmiMessageOverweight || ""} onChange={(v) => set("bmiMessageOverweight", v)} />
                </>
              )}

              {/* Available Units */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Available Units</label>
                  <button onClick={addUnit} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    + Add Unit
                  </button>
                </div>
                {(draft.availableUnits || []).map((u, i) => (
                  <div key={i} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">unit</label>
                      <input value={u.unit} onChange={(e) => updateUnit(i, { unit: e.target.value })} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">label</label>
                      <input value={u.label} onChange={(e) => updateUnit(i, { label: e.target.value })} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">ratio</label>
                      <input type="number" step="any" value={u.ratio} onChange={(e) => updateUnit(i, { ratio: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border rounded text-sm border-amber-200" />
                    </div>
                    <button onClick={() => removeUnit(i)} className="text-red-400 hover:text-red-600 pb-1.5">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  warn,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  warn?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {warn && <span className="text-amber-500">&#x26A0;</span>}
      </label>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none ${warn ? "border-amber-200" : ""}`}
      />
    </div>
  );
}
