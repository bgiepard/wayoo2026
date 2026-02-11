import { useState, useEffect, useRef } from "react";
import Modal from "./ui/Modal";
import { labelBase, inputBase } from "./ui/modalStyles";
import { ChildIcon, ChevronDownIcon } from "./icons";

interface PassengersModalProps {
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
}: {
  value: number;
  onChange: (age: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = AGE_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputBase} flex items-center text-left ${open ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-[#5B5E68]">
          <ChildIcon className="w-5 h-5" />
        </div>
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : "Wybierz wiek"}
        </span>
        <ChevronDownIcon className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[200px] overflow-y-auto">
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
        </div>
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
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          disabled={!canDecrement}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={`${counterBox} transition-colors ${
            canDecrement
              ? "border-[#0B298F] text-[#0B298F] hover:bg-blue-50"
              : "border-[#D9DADC] bg-[#F0F0F1] text-[#8E8F96] cursor-not-allowed"
          }`}
        >
          -
        </button>
        <span className={`${counterBox} border-[#D9DADC] bg-[#FCFDFD] text-gray-900`}>
          {value}
        </span>
        <button
          type="button"
          disabled={!canIncrement}
          onClick={() => onChange(value + 1)}
          className={`${counterBox} transition-colors ${
            canIncrement
              ? "border-[#0B298F] text-[#0B298F] hover:bg-blue-50"
              : "border-[#D9DADC] bg-[#F0F0F1] text-[#8E8F96] cursor-not-allowed"
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wybierz liczbę pasażerów"

      onConfirm={handleSave}
      confirmDisabled={!isValid}
      confirmLabel={confirmLabel}
    >
      <div className="flex flex-col">
        <Counter label="Dorośli" value={localAdults} min={1} onChange={setLocalAdults} />
        <div className="h-[24px]" />
        <Counter label="Dzieci" value={localChildren} min={0} onChange={handleChildrenChange} />

        {localChildren > 0 && (
          <label className="flex items-center gap-3 mt-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={localNeedsSeats}
              onChange={(e) => setLocalNeedsSeats(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm">Potrzebujesz fotelików?</span>
          </label>
        )}

        {localNeedsSeats && localChildren > 0 && (
          <div className="flex flex-col gap-4 mt-2">
            {localAges.map((age, index) => (
              <div key={index}>
                <label className={labelBase}>Wiek dziecka #{index + 1}</label>
                <AgeDropdown
                  value={age}
                  onChange={(val) => handleAgeChange(index, val)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
