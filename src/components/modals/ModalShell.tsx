import { ReactNode } from "react";
import { CloseIcon } from "@/components/icons";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
}

export default function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  noPadding = false,
}: ModalShellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white shadow-2xl flex flex-col w-full h-full md:h-auto md:rounded-[20px] md:w-full md:max-w-[560px] overflow-hidden">

        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-surface">
          <div>
            <h2 className="text-ink text-[18px] font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-tertiary text-[13px] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-tertiary hover:text-secondary p-1.5 rounded-full hover:bg-surface transition-colors flex-shrink-0"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto${noPadding ? "" : " px-7 py-6"}`}>
          {children}
        </div>

        {footer && (
          <div className="px-7 pb-6 pt-4 border-t border-surface">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
