import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const MINUTES = [0, 10, 20, 30, 40, 50];
const pad = (n: number) => String(n).padStart(2, "0");

interface TimePickerProps {
  value: string; // format "HH:MM"
  onChange: (time: string) => void;
  className?: string;
}

export default function TimePicker({
  value,
  onChange,
  className = "",
}: TimePickerProps) {
  const { hour, minute } = useMemo(() => {
    if (!value) return { hour: 12, minute: 0 };
    const [h, m] = value.split(":");
    const parsedMin = parseInt(m || "0");
    const rounded = Math.round(parsedMin / 10) * 10;
    return {
      hour: parseInt(h || "12"),
      minute: rounded >= 60 ? 50 : rounded,
    };
  }, [value]);

  const stepHour = useCallback(
    (dir: 1 | -1) => {
      const next = (hour + dir + 24) % 24;
      onChange(`${pad(next)}:${pad(minute)}`);
    },
    [hour, minute, onChange]
  );

  const stepMinute = useCallback(
    (dir: 1 | -1) => {
      const idx = MINUTES.indexOf(minute);
      const next = MINUTES[(idx + dir + MINUTES.length) % MINUTES.length];
      onChange(`${pad(hour)}:${pad(next)}`);
    },
    [hour, minute, onChange]
  );

  // --- Edycja ręczna ---
  const [editingField, setEditingField] = useState<"hour" | "minute" | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const startEdit = (field: "hour" | "minute") => {
    setEditingField(field);
    setEditValue(field === "hour" ? pad(hour) : pad(minute));
  };

  const commitEdit = () => {
    if (!editingField) return;
    const num = parseInt(editValue);

    if (editingField === "hour" && !isNaN(num) && num >= 0 && num <= 23) {
      onChange(`${pad(num)}:${pad(minute)}`);
    } else if (editingField === "minute" && !isNaN(num) && num >= 0 && num <= 59) {
      const rounded = Math.round(num / 10) * 10;
      onChange(`${pad(hour)}:${pad(rounded >= 60 ? 50 : rounded)}`);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingField(null);
  };

  const chevronBtn =
    "w-8 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors active:scale-90";

  const chevronUp = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );

  const chevronDown = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const renderDigit = (field: "hour" | "minute", val: number) => {
    if (editingField === field) {
      return (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value.replace(/\D/g, ""))}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-12 text-center text-2xl font-semibold text-blue-600 tabular-nums
                     bg-blue-50 rounded-lg outline-none leading-tight py-0.5"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => startEdit(field)}
        className="text-2xl font-semibold text-gray-800 tabular-nums w-12 text-center
                   select-none leading-tight hover:text-blue-600 transition-colors
                   rounded-lg hover:bg-blue-50 py-0.5 cursor-text"
        title="Kliknij aby wpisać"
      >
        {pad(val)}
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Godziny */}
      <div className="flex flex-col items-center">
        <button type="button" onClick={() => stepHour(1)} className={chevronBtn}>
          {chevronUp}
        </button>
        {renderDigit("hour", hour)}
        <button type="button" onClick={() => stepHour(-1)} className={chevronBtn}>
          {chevronDown}
        </button>
      </div>

      {/* Separator */}
      <span className="text-2xl font-bold text-gray-300 select-none mb-0.5">:</span>

      {/* Minuty */}
      <div className="flex flex-col items-center">
        <button type="button" onClick={() => stepMinute(1)} className={chevronBtn}>
          {chevronUp}
        </button>
        {renderDigit("minute", minute)}
        <button type="button" onClick={() => stepMinute(-1)} className={chevronBtn}>
          {chevronDown}
        </button>
      </div>
    </div>
  );
}
