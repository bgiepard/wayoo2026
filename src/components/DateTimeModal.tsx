import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { labelBase } from "./ui/modalStyles";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data i godzina"

      onConfirm={handleSave}
      confirmDisabled={!isValid}
      confirmLabel={confirmLabel}
    >
      <div className="flex flex-col">
        <div className="mb-6">
          <label className={labelBase}>Data przejazdu</label>
          <DatePicker value={localDate} onChange={setLocalDate} />
        </div>

        <div>
          <label className={labelBase}>Godzina odjazdu</label>
          <TimePicker value={localTime} onChange={setLocalTime} />
        </div>
      </div>
    </Modal>
  );
}
