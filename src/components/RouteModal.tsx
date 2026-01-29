import { useState, useEffect } from "react";
import Modal from "./ui/Modal";

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

  const handleSave = () => {
    onSave(localFrom, localTo);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trasa">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Skad"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          className="border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Dokad"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
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
