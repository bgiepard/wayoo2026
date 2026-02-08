import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";

interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  time: string;
  onSave: (date: string, time: string) => void;
  onNext?: () => void;
}

export default function DateTimeModal({
  isOpen,
  onClose,
  date,
  time,
  onSave,
  onNext,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data i godzina" width="w-96">
      <div className="flex flex-col gap-6">
        {/* ===== SEKCJA: DATA ===== */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Data przejazdu
          </h3>
          <DatePicker value={localDate} onChange={setLocalDate} />
        </section>

        {/* ===== SEPARATOR ===== */}
        <div className="border-t border-gray-100" />

        {/* ===== SEKCJA: GODZINA ===== */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Godzina odjazdu
          </h3>
          <TimePicker value={localTime} onChange={setLocalTime} />
        </section>

        {/* ===== PRZYCISK ===== */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {onNext ? "Dalej" : "Zapisz"}
        </button>
      </div>
    </Modal>
  );
}
