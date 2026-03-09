"use client";

import { useState, useRef } from "react";
import { ValidationError } from "@/lib/types";

interface Props {
  onImport: (json: string) => ValidationError[];
  onClose: () => void;
}

export default function ImportModal({ onImport, onClose }: Props) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLoad = () => {
    if (!text.trim()) return;
    const errs = onImport(text);
    setErrors(errs);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Import JSON</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste JSON or upload a file
            </label>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setErrors([]); }}
              rows={12}
              placeholder='{"questions": [...]}'
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Or upload a .json file
            </button>
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-700 mb-1">Validation Errors (not imported):</h4>
              <ul className="space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-600">
                    <span className="font-mono bg-red-100 px-1 rounded mr-1">Rule {e.ruleNumber}</span>
                    {e.questionId && <span className="font-mono mr-1">[{e.questionId}]</span>}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleLoad}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
