import { ReactNode } from "react";
import { CloseIcon } from "../icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "w-[480px]",
  onConfirm,
  confirmDisabled = false,
  confirmLabel = "Potwierdź",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 shadow-xl ${width}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-[20px] text-[#0B298F]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600  p-3"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
        {onConfirm && (
          <div className="flex justify-end mt-8">
            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="px-6 py-3 text-white text-[14px] font-medium rounded-lg transition-colors leading-[140%]"
              style={{ backgroundColor: confirmDisabled ? "#8E8F96" : "#0B298F" }}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
