import { useState, useEffect } from "react";

interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  time: string;
  onSave: (date: string, time: string) => void;
}

export default function DateTimeModal({ isOpen, onClose, date, time, onSave }: DateTimeModalProps) {
  const [localDate, setLocalDate] = useState(date);
  const [localTime, setLocalTime] = useState(time);

  useEffect(() => {
    setLocalDate(date);
    setLocalTime(time);
  }, [date, time]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localDate, localTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2>Data i godzina</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            className="border border-gray-300 p-2"
          />
          <input
            type="time"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="border border-gray-300 p-2"
          />
          <button onClick={handleSave} className="border border-gray-300 p-2">
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
