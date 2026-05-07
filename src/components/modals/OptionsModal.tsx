import { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import type { Options } from "@/models";

export type { Options } from "@/models";

export interface OptionsModalProps {
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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Dodatkowe opcje"
      subtitle="Wybierz udogodnienia dla tej trasy"
      footer={
        <button
          data-cy="btn-modal-confirm"
          onClick={handleSave}
          className="w-full py-3 rounded-[10px] text-white text-[15px] font-semibold transition-all"
          style={{ backgroundColor: "#0B298F" }}
        >
          Potwierdź
        </button>
      }
    >
      <div className="flex flex-col gap-1">
        {(Object.keys(optionLabels) as Array<keyof Options>).map((key) => (
          <label
            key={key}
            className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-[#F8F9FA] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={localOptions[key]}
              onChange={() => handleToggle(key)}
              className="w-4 h-4 accent-[#0B298F]"
            />
            <span className="text-[15px] text-[#010101]">{optionLabels[key]}</span>
          </label>
        ))}
      </div>
    </ModalShell>
  );
}
