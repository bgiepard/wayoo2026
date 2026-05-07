import { useState, useEffect, useRef, CSSProperties } from "react";
import { createPortal } from "react-dom";
import ModalShell from "./ModalShell";
import { labelBase, inputBase } from "@/components/ui/modalStyles";
import { ChildIcon, ChevronDownIcon, DraftCheckIcon } from "@/components/icons";

export interface PassengersModalProps {
  isOpen: boolean;
  onClose: () => void;
  adults: number;
  children: number;
  needsChildSeats: boolean;
  childrenAges: number[];
  onSave: (adults: number, children: number, needsChildSeats: boolean, childrenAges: number[]) => void;
  onNext?: () => void;
  confirmLabel?: string;
}

const AGE_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const y = i + 1;
  return { value: y, label: `${y} ${y === 1 ? "rok" : y < 5 ? "lata" : "lat"}` };
});

function AgeDropdown({
  value,
  onChange,
  dataCy,
}: {
  value: number;
  onChange: (age: number) => void;
  dataCy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        listRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  };

  const selected = AGE_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        data-cy={dataCy}
        onClick={handleToggle}
        className={`${inputBase} flex items-center text-left ${open ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-secondary">
          <ChildIcon className="w-5 h-5" />
        </div>
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : "Wybierz wiek"}
        </span>
        <ChevronDownIcon className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          style={dropdownStyle}
          className="bg-white rounded-lg shadow-xl border border-gray-200 max-h-[200px] overflow-y-auto"
        >
          {AGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg
                ${option.value === value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

const counterBox = "w-[44px] h-[44px] flex items-center justify-center rounded-[6px] border text-sm font-medium select-none";

function Counter({
  label,
  value,
  min,
  max,
  onChange,
  dataCy,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  dataCy?: string;
}) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-ink text-[16px]">{label}</span>
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          data-cy={dataCy ? `${dataCy}-decrement` : undefined}
          disabled={!canDecrement}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={`${counterBox} transition-colors ${
            canDecrement
              ? "border-navy text-navy hover:bg-blue-50"
              : "border-line bg-surface text-tertiary cursor-not-allowed"
          }`}
        >
          -
        </button>
        <span className={`${counterBox} border-line bg-[#FCFDFD] text-gray-900`}>
          {value}
        </span>
        <button
          type="button"
          data-cy={dataCy ? `${dataCy}-increment` : undefined}
          disabled={!canIncrement}
          onClick={() => onChange(value + 1)}
          className={`${counterBox} transition-colors ${
            canIncrement
              ? "border-navy text-navy hover:bg-blue-50"
              : "border-line bg-surface text-tertiary cursor-not-allowed"
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PassengersModal({
  isOpen,
  onClose,
  adults,
  children,
  needsChildSeats,
  childrenAges,
  onSave,
  onNext,
  confirmLabel,
}: PassengersModalProps) {
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);
  const [localNeedsSeats, setLocalNeedsSeats] = useState(needsChildSeats);
  const [localAges, setLocalAges] = useState<number[]>(childrenAges);

  useEffect(() => {
    setLocalAdults(adults);
    setLocalChildren(children);
    setLocalNeedsSeats(needsChildSeats);
    setLocalAges(childrenAges);
  }, [adults, children, needsChildSeats, childrenAges]);

  const handleChildrenChange = (count: number) => {
    setLocalChildren(count);
    if (count === 0) {
      setLocalNeedsSeats(false);
      setLocalAges([]);
    } else {
      setLocalAges((prev) => {
        if (count > prev.length) {
          return [...prev, ...Array(count - prev.length).fill(0)];
        }
        return prev.slice(0, count);
      });
    }
  };

  const handleAgeChange = (index: number, age: number) => {
    const newAges = [...localAges];
    newAges[index] = age;
    setLocalAges(newAges);
  };

  const handleSave = () => {
    onSave(localAdults, localChildren, localNeedsSeats, localNeedsSeats ? localAges : []);
    if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const isValid = !localNeedsSeats || localAges.every((age) => age > 0);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Pasażerowie"
      subtitle="Podaj liczbę osób w grupie"
      footer={
        <button
          data-cy="btn-modal-confirm"
          onClick={handleSave}
          disabled={!isValid}
          className="w-full py-3 rounded-[10px] text-white text-[15px] font-semibold transition-all"
          style={{ backgroundColor: isValid ? "#0B298F" : "#D9DADC" }}
        >
          {confirmLabel || "Potwierdź"}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <Counter label="Dorośli" value={localAdults} min={1} onChange={setLocalAdults} dataCy="adults" />
        <Counter label="Dzieci" value={localChildren} min={0} onChange={handleChildrenChange} dataCy="children" />

        {localChildren > 0 && (
          <button
            type="button"
            data-cy="checkbox-child-seats"
            onClick={() => setLocalNeedsSeats(!localNeedsSeats)}
            className="flex items-center gap-3 mt-1 cursor-pointer group"
          >
            <div
              className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0 ${
                localNeedsSeats
                  ? "bg-navy border-navy"
                  : "border-line bg-white group-hover:border-tertiary"
              }`}
            >
              {localNeedsSeats && <DraftCheckIcon />}
            </div>
            <span className="text-ink text-[16px]">Potrzebujesz fotelików?</span>
          </button>
        )}

        {localNeedsSeats && localChildren > 0 && (
          <div className="flex flex-col gap-4 mt-2">
            {localAges.map((age, index) => (
              <div key={index}>
                <label className={labelBase}>Wiek dziecka #{index + 1}</label>
                <AgeDropdown
                  value={age}
                  onChange={(val) => handleAgeChange(index, val)}
                  dataCy={`age-dropdown-${index}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
