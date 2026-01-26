import { useState, useEffect } from "react";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  onSave: (from: string, to: string) => void;
}

export default function RouteModal({ isOpen, onClose, from, to, onSave }: RouteModalProps) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  useEffect(() => {
    setLocalFrom(from);
    setLocalTo(to);
  }, [from, to]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localFrom, localTo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2>Trasa</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Skąd"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="border border-gray-300 p-2"
          />
          <input
            type="text"
            placeholder="Dokąd"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
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
