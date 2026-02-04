import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import type { Options } from "@/models";

export type { Options } from "@/models";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: Options;
  onSave: (options: Options) => void;
  onNext?: () => void;
}

const optionLabels: Record<keyof Options, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

export default function OptionsModal({ isOpen, onClose, options, onSave, onNext }: OptionsModalProps) {
  const [localOptions, setLocalOptions] = useState<Options>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleToggle = (key: keyof Options) => {
    setLocalOptions({ ...localOptions, [key]: !localOptions[key] });
  };

  const handleSave = () => {
    onSave(localOptions);
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dodatkowe opcje">
      <div className="flex flex-col gap-3">
        {(Object.keys(optionLabels) as Array<keyof Options>).map((key) => (
          <label
            key={key}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={localOptions[key]}
              onChange={() => handleToggle(key)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm">{optionLabels[key]}</span>
          </label>
        ))}
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium mt-2"
        >
          {onNext ? "Dalej" : "Zapisz"}
        </button>
      </div>
    </Modal>
  );
}
