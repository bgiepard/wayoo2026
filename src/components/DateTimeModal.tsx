import { useState, useEffect } from "react";
import Modal from "./ui/Modal";

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

  const handleSave = () => {
    onSave(localDate, localTime);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data i godzina">
      <div className="flex flex-col gap-4">
        <input
          type="date"
          value={localDate}
          onChange={(e) => setLocalDate(e.target.value)}
          className="border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500"
        />
        <input
          type="time"
          value={localTime}
          onChange={(e) => setLocalTime(e.target.value)}
          className="border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500"
        />
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium"
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}
