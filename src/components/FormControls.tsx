"use client";

export function FieldWrap({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="field-label">{label}</p>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function RadioPills({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: number; label: string }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            name={name}
            onClick={() => onChange(opt.value)}
            className={`choice-pill ${checked ? "choice-pill-active" : "choice-pill-inactive"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckboxRow({
  options,
  values,
  onToggle,
}: {
  options: { key: string; label: string }[];
  values: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = !!values[opt.key];
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onToggle(opt.key)}
            className={`choice-pill flex items-center gap-1.5 ${
              checked ? "choice-pill-active" : "choice-pill-inactive"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                checked ? "bg-white border-white" : "border-gray-400"
              }`}
            >
              {checked && (
                <svg className="w-2.5 h-2.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function NumberField({
  value,
  onChange,
  placeholder,
  min,
  max,
  suffix,
  className,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <input
        type="number"
        inputMode="numeric"
        className="field-input"
        placeholder={placeholder}
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
      {suffix && <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className="field-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
