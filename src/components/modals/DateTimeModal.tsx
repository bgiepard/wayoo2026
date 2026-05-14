import { useState, useEffect } from "react";
import { Calendar } from "iconoir-react";
import ModalShell from "./ModalShell";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import { formatDatePL } from "@/utils/formatDate";

export interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  time: string;
  onSave: (date: string, time: string) => void;
  onNext?: () => void;
  confirmLabel?: string;
}

export default function DateTimeModal({
  isOpen,
  onClose,
  date,
  time,
  onSave,
  onNext,
  confirmLabel,
}: DateTimeModalProps) {
  const [localDate, setLocalDate] = useState(date);
  const [localTime, setLocalTime] = useState(time);

  useEffect(() => {
    setLocalDate(date);
    setLocalTime(time);
  }, [date, time]);

  const handleDateChange = (d: string) => {
    setLocalDate(d);
    if (!localTime) setLocalTime("08:00");
  };

  const handleSave = () => {
    onSave(localDate, localTime || "08:00");
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const isValid = !!localDate;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Data i godzina"
      subtitle="Wybierz termin wyjazdu"
      noPadding
      footer={
        <>
          {localDate && (
            <div className="flex items-center gap-3 bg-[#F8F9FF] border border-[#E0E7FF] rounded-[10px] px-4 py-3 mb-4">
              <Calendar width={15} height={15} color="#0B298F" strokeWidth={1.8} className="shrink-0" />
              <span className="text-navy text-[14px] font-medium">
                {formatDatePL(localDate)}{(localTime || "08:00") && ` · ${localTime || "08:00"}`}
              </span>
            </div>
          )}
          <button
            data-cy="btn-modal-confirm"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-3 rounded-[10px] text-white text-[15px] font-semibold transition-all"
            style={{ backgroundColor: isValid ? "#0B298F" : "#D9DADC" }}
          >
            {confirmLabel || "Potwierdź"}
          </button>
        </>
      }
    >
      <div className="flex md:flex-row flex-col">
        {/* Lewa: kalendarz */}
        <div className="flex-1 px-7 pt-6 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-tertiary mb-4">Data wyjazdu</p>
          <DatePicker value={localDate} onChange={handleDateChange} />
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px bg-surface my-6" />
        <div className="block md:hidden h-px bg-surface mx-7" />

        {/* Prawa: godzina */}
        <div className="md:w-[200px] px-7 pt-6 pb-6 flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-tertiary mb-4">Godzina odjazdu</p>
          <div className="flex-1 flex items-center justify-center">
            <TimePicker value={localTime} onChange={setLocalTime} />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
