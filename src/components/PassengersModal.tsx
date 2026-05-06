import { useState, useEffect, useRef } from "react";
import { labelBase, inputBase } from "./ui/modalStyles";
import { ChildIcon, ChevronDownIcon, DraftCheckIcon, CloseIcon } from "./icons";

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
  dataCy,
}: {
  value: number;
  onChange: (age: number) => void;
  dataCy?: string;
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
        data-cy={dataCy}
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
      <span className="text-[#010101] text-[16px]">{label}</span>
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          data-cy={dataCy ? `${dataCy}-decrement` : undefined}
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
          data-cy={dataCy ? `${dataCy}-increment` : undefined}
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white shadow-2xl flex flex-col w-full h-full md:h-auto md:rounded-[20px] md:w-full md:max-w-[440px] overflow-hidden">

        {/* Nagłówek */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#F0F1F3]">
          <div>
            <h2 className="text-[#010101] text-[18px] font-[600]">Pasażerowie</h2>
            <p className="text-[#9B9DA3] text-[13px] mt-0.5">Podaj liczbę osób w grupie</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9DA3] hover:text-[#5B5E68] p-1.5 rounded-full hover:bg-[#F0F1F3] transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Treść */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
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
                      ? "bg-[#0B298F] border-[#0B298F]"
                      : "border-[#D9DADC] bg-white group-hover:border-[#9B9DA3]"
                  }`}
                >
                  {localNeedsSeats && <DraftCheckIcon />}
                </div>
                <span className="text-[#010101] text-[16px]">Potrzebujesz fotelików?</span>
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
        </div>

        {/* Stopka */}
        <div className="px-7 pb-6 pt-4 border-t border-[#F0F1F3]">
          <button
            data-cy="btn-modal-confirm"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-3 rounded-[10px] text-white text-[15px] font-[600] transition-all"
            style={{ backgroundColor: isValid ? "#0B298F" : "#D9DADC" }}
          >
            {confirmLabel || "Potwierdź"}
          </button>
        </div>

      </div>
    </div>
  );
}
