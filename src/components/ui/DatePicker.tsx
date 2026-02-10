import { useState, useMemo, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

const DAY_NAMES_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

interface DatePickerProps {
  value: string; // format YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  className = "",
}: DatePickerProps) {
  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const [viewYear, setViewYear] = useState(
    () => selectedDate?.getFullYear() ?? new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => selectedDate?.getMonth() ?? new Date().getMonth()
  );

  // --- Stałe ---

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const minDateObj = useMemo(() => {
    if (minDate) return new Date(minDate + "T00:00:00");
    return today;
  }, [minDate, today]);

  // --- Nawigacja ---

  const goToPrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }, [today]);

  const canGoPrev = useMemo(() => {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const lastDayOfPrev = new Date(prevYear, prevMonth + 1, 0);
    return lastDayOfPrev >= minDateObj;
  }, [viewMonth, viewYear, minDateObj]);

  // --- Siatka kalendarza ---

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewYear, viewMonth]);

  // --- Helpery ---

  const isSelected = (day: number) =>
    selectedDate !== null &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isDisabled = (day: number) =>
    new Date(viewYear, viewMonth, day) < minDateObj;

  const isWeekend = (day: number) => {
    const d = new Date(viewYear, viewMonth, day).getDay();
    return d === 0 || d === 6;
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(formatted);
  };

  const isCurrentMonthView =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className={className}>
      {/* Nawigacja między miesiącami */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full
                     hover:bg-gray-100 active:bg-gray-200
                     disabled:opacity-25 disabled:cursor-not-allowed
                     transition-colors"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          type="button"
          onClick={goToToday}
          disabled={isCurrentMonthView}
          className="text-sm font-semibold text-gray-800
                     hover:text-blue-600 disabled:hover:text-gray-800
                     transition-colors cursor-pointer disabled:cursor-default"
          title={isCurrentMonthView ? undefined : "Wróć do bieżącego miesiąca"}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </button>

        <button
          type="button"
          onClick={goToNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full
                     hover:bg-gray-100 active:bg-gray-200
                     transition-colors"
          aria-label="Następny miesiąc"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Nazwy dni */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES_SHORT.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-gray-400 py-1.5 select-none"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Siatka */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {calendarDays.map((day, index) => (
          <div key={index} className="flex items-center justify-center">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isDisabled(day)}
                className={`
                  w-10 h-10 rounded-full text-sm font-medium
                  transition-all duration-150 relative
                  ${
                    isSelected(day)
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                      : isToday(day)
                        ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200"
                        : isDisabled(day)
                          ? "text-gray-300 cursor-not-allowed"
                          : isWeekend(day)
                            ? "text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                            : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  }
                `}
              >
                {day}
              </button>
            ) : (
              <div className="w-10 h-10" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
