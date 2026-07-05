import { useEffect, useRef, useState } from "react";

type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
};

function SearchableSelect({ value, onChange, options, placeholder, className }: SearchableSelectProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onChange(query);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filteredOptions = options
    .filter((option) => option.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 50);

  const selectOption = (option: string) => {
    setQuery(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      } else {
        onChange(query);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightedIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[220px] overflow-y-auto rounded-[14px] border border-white/10 bg-[#1c1f52] shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[15px] transition ${
                index === highlightedIndex
                  ? "bg-[#7f4cff]/25 text-white"
                  : "text-white/85 hover:bg-white/[0.06]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
