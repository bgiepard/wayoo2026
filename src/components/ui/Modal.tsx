import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "w-80",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 shadow-xl ${width}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
