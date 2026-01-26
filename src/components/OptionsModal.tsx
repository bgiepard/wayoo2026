import { useState, useEffect } from "react";

export interface Options {
  wifi: boolean;
  wc: boolean;
  tv: boolean;
  airConditioning: boolean;
  powerOutlet: boolean;
}

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: Options;
  onSave: (options: Options) => void;
}

const optionLabels: Record<keyof Options, string> = {
  wifi: "WiFi",
  wc: "WC",
  tv: "Telewizor",
  airConditioning: "Klimatyzacja",
  powerOutlet: "Gniazdko elektryczne",
};

export default function OptionsModal({ isOpen, onClose, options, onSave }: OptionsModalProps) {
  const [localOptions, setLocalOptions] = useState<Options>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof Options) => {
    setLocalOptions({ ...localOptions, [key]: !localOptions[key] });
  };

  const handleSave = () => {
    onSave(localOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-300 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2>Dodatkowe opcje</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex flex-col gap-3">
          {(Object.keys(optionLabels) as Array<keyof Options>).map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOptions[key]}
                onChange={() => handleToggle(key)}
                className="w-4 h-4"
              />
              <span>{optionLabels[key]}</span>
            </label>
          ))}

          <button onClick={handleSave} className="border border-gray-300 p-2 mt-2">
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
