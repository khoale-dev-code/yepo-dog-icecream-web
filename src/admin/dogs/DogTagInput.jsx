import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

export function DogTagInput({
  label,
  value,
  suggestions = [],
  placeholder,
  onChange,
}) {
  const [input, setInput] = useState("");

  const visibleSuggestions = useMemo(() => {
    const keyword = input.trim().toLowerCase();

    if (!keyword) return suggestions.filter((item) => !value.includes(item)).slice(0, 8);

    return suggestions
      .filter((item) => item.toLowerCase().includes(keyword))
      .filter((item) => !value.includes(item))
      .slice(0, 8);
  }, [input, suggestions, value]);

  function addTag(raw) {
    const next = String(raw || "").trim();

    if (!next) return;
    if (value.includes(next)) {
      setInput("");
      return;
    }

    onChange([...value, next]);
    setInput("");
  }

  function removeTag(tag) {
    onChange(value.filter((item) => item !== tag));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(input);
    }

    if (event.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </label>

      <div className="rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-2 focus-within:border-[#b98c49] focus-within:ring-4 focus-within:ring-[#b98c49]/10">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#f7efe3] px-3 py-1.5 text-xs font-brand text-[#8c672f]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-[#d8b77e]/30"
                aria-label={`Xóa ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length ? "Thêm tag..." : placeholder}
            className="h-9 min-w-[140px] flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-neutral-400"
          />

          <button
            type="button"
            onClick={() => addTag(input)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#b98c49] text-white"
            aria-label="Thêm tag"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {visibleSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              className="rounded-full border border-[#d8b77e] bg-white px-3 py-1.5 text-xs font-brand text-[#756144] transition hover:bg-[#f7efe3] hover:text-[#8c672f]"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-[11px] font-normal text-[#8c672f]">
        Gõ nội dung rồi bấm Enter để lưu tag.
      </p>
    </div>
  );
}
