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
    </Modal>
  );
}
