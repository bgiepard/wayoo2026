import { useState, useEffect } from "react";

interface PassengersModalProps {
  isOpen: boolean;
  onClose: () => void;
  adults: number;
  children: number;
  onSave: (adults: number, children: number) => void;
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

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localAdults, localChildren);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2>Pasażerowie</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span>Dorośli</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalAdults(Math.max(1, localAdults - 1))}
                className="border border-gray-300 w-8 h-8"
              >
                -
              </button>
              <span className="w-8 text-center">{localAdults}</span>
              <button
                type="button"
                onClick={() => setLocalAdults(localAdults + 1)}
                className="border border-gray-300 w-8 h-8"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span>Dzieci</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalChildren(Math.max(0, localChildren - 1))}
                className="border border-gray-300 w-8 h-8"
              >
                -
              </button>
              <span className="w-8 text-center">{localChildren}</span>
              <button
                type="button"
                onClick={() => setLocalChildren(localChildren + 1)}
                className="border border-gray-300 w-8 h-8"
              >
                +
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="border border-gray-300 p-2">
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
