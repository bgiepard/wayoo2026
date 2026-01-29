import { useState, useEffect } from "react";
import Modal from "./ui/Modal";

interface PassengersModalProps {
  isOpen: boolean;
  onClose: () => void;
  adults: number;
  children: number;
  onSave: (adults: number, children: number) => void;
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          -
        </button>
        <span className="w-6 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PassengersModal({
  isOpen,
  onClose,
  adults,
  children,
  onSave,
}: PassengersModalProps) {
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);

  useEffect(() => {
    setLocalAdults(adults);
    setLocalChildren(children);
  }, [adults, children]);

  const handleSave = () => {
    onSave(localAdults, localChildren);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pasazerowie">
      <div className="flex flex-col gap-2">
        <Counter label="Dorosli" value={localAdults} min={1} onChange={setLocalAdults} />
        <Counter label="Dzieci" value={localChildren} min={0} onChange={setLocalChildren} />
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium mt-4"
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}
