// Temperature unit toggle component (F/C)

interface TempUnitToggleProps {
  value: "C" | "F";
  onChange: (unit: "C" | "F") => void;
}

export function TempUnitToggle({ value, onChange }: TempUnitToggleProps) {
  return (
    <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
      <button
        onClick={() => onChange("F")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          value === "F"
            ? "bg-[#c4dfc4] text-black"
            : "text-gray-400 hover:text-white"
        }`}
      >
        °F
      </button>
      <button
        onClick={() => onChange("C")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          value === "C"
            ? "bg-[#c4dfc4] text-black"
            : "text-gray-400 hover:text-white"
        }`}
      >
        °C
      </button>
    </div>
  );
}

