"use client";

import { OPTION_SETS, OptionSetKey, SubQuestion } from "@/lib/questions";

interface Props {
  itemId: number;
  question: SubQuestion;
  value: number | null;
  onChange: (value: number) => void;
}

const GRADE_LABEL: Record<string, string> = {
  frequency: "빈도",
  severity: "중증도",
  interference: "일상생활 지장",
  amount: "정도",
  none: "",
};

// 5-option numeric scales get the compact numbered-circle layout;
// everything else (yn2 / sev6 / sev7 / freq7 / ynsex4 / ynna3) gets full-width pills.
const NUMERIC_SETS: OptionSetKey[] = ["freq5", "sev5", "int5"];

export default function QuestionItem({ itemId, question, value, onChange }: Props) {
  const optionKey = `q-${itemId}-${question.key}`;
  const options = OPTION_SETS[question.optionSet];
  const isNumeric = NUMERIC_SETS.includes(question.optionSet);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        {GRADE_LABEL[question.grade] && (
          <span className="mt-0.5 px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500 font-medium whitespace-nowrap">
            {GRADE_LABEL[question.grade]}
          </span>
        )}
        <p className="text-sm font-medium text-gray-800 leading-relaxed">{question.text}</p>
      </div>

      {isNumeric ? (
        <div className="grid grid-cols-5 gap-1.5">
          {options.map((label, idx) => {
            const checked = value === idx;
            return (
              <label key={idx} className="radio-option">
                <input type="radio" name={optionKey} checked={checked} onChange={() => onChange(idx)} />
                <span className="radio-label">
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      checked ? "border-primary-600 bg-primary-600 text-white" : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {idx}
                  </span>
                  <span className="text-xs leading-tight">{label}</span>
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((label, idx) => {
            const checked = value === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(idx)}
                className={`choice-pill ${checked ? "choice-pill-active" : "choice-pill-inactive"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
