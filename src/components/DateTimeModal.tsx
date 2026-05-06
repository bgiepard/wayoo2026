import { useState, useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { Calendar } from "iconoir-react";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";
import { formatDatePL } from "@/lib/formatDate";

interface DateTimeModalProps {
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

  const handleSave = () => {
    onSave(localDate, localTime);
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const isValid = localDate && localTime;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white shadow-2xl flex flex-col w-full h-full md:h-auto md:rounded-[20px] md:w-full md:max-w-[600px] overflow-hidden">

        {/* Nagłówek */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#F0F1F3]">
          <div>
            <h2 className="text-[#010101] text-[18px] font-[600]">Data i godzina</h2>
            <p className="text-[#9B9DA3] text-[13px] mt-0.5">Wybierz termin wyjazdu</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9DA3] hover:text-[#5B5E68] p-1.5 rounded-full hover:bg-[#F0F1F3] transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Treść — dwie kolumny */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex md:flex-row flex-col">

            {/* Lewa: kalendarz */}
            <div className="flex-1 px-7 pt-6 pb-6">
              <p className="text-[11px] font-[600] uppercase tracking-wide text-[#9B9DA3] mb-4">Data wyjazdu</p>
              <DatePicker value={localDate} onChange={setLocalDate} />
            </div>

            {/* Separator pionowy */}
            <div className="hidden md:block w-px bg-[#F0F1F3] my-6" />
            <div className="block md:hidden h-px bg-[#F0F1F3] mx-7" />

            {/* Prawa: godzina */}
            <div className="md:w-[200px] px-7 pt-6 pb-6 flex flex-col">
              <p className="text-[11px] font-[600] uppercase tracking-wide text-[#9B9DA3] mb-4">Godzina odjazdu</p>
              <div className="flex-1 flex items-center justify-center">
                <TimePicker value={localTime} onChange={setLocalTime} />
              </div>
            </div>

          </div>
        </div>

        {/* Stopka */}
        <div className="px-7 pb-6 pt-4 border-t border-[#F0F1F3]">
          {localDate && localTime && (
            <div className="flex items-center gap-3 bg-[#F8F9FF] border border-[#E0E7FF] rounded-[10px] px-4 py-3 mb-4">
              <Calendar width={15} height={15} color="#0B298F" strokeWidth={1.8} className="shrink-0"/>
              <span className="text-[#0B298F] text-[14px] font-[500]">
                {formatDatePL(localDate)} · {localTime}
              </span>
            </div>
          )}
          <button
            data-cy="btn-modal-confirm"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-3 rounded-[10px] text-white text-[15px] font-[600] transition-all"
            style={{ backgroundColor: isValid ? "#0B298F" : "#D9DADC" }}
          >
            {confirmLabel || "Potwierdź"}
          </button>
        </div>

      </div>
    </div>
  );
}
