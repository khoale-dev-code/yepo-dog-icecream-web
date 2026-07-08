const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/ProductEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/ProductEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Thêm useState
content = content.replace(
  'import { useEffect, useMemo } from "react";',
  'import { useEffect, useMemo, useState } from "react";'
);

// Thay Field Tags cũ bằng TagInput
const oldTagField = `            <Field
              label="Tags"
              value={form.tags}
              placeholder="Cà phê, Matcha, Trà đào"
              onChange={(value) => update("tags", value)}
            />`;

const newTagField = `            <TagInput
              label="Tags"
              value={form.tags}
              placeholder="Nhập tag rồi bấm Enter"
              onChange={(value) => update("tags", value)}
            />`;

if (!content.includes(oldTagField)) {
  throw new Error("Không tìm thấy block Field Tags cũ để thay thế.");
}

content = content.replace(oldTagField, newTagField);

// Thêm component TagInput trước function Field
const marker = `function Field({ label, value, onChange, required, inputMode, placeholder, helper }) {`;

const tagInputComponent = `
function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/[,\\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueTags(tags) {
  const seen = new Set();

  return tags.filter((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function TagInput({ label, value, onChange, placeholder }) {
  const tags = uniqueTags(normalizeTags(value));
  const [draft, setDraft] = useState("");

  function commitTag(rawValue = draft) {
    const nextTags = String(rawValue || "")
      .split(/[,\\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (nextTags.length === 0) return;

    const mergedTags = uniqueTags([...tags, ...nextTags]);
    onChange(mergedTags.join(", "));
    setDraft("");
  }

  function removeTag(tagToRemove) {
    const nextTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(nextTags.join(", "));
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <div className="rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 py-2 transition focus-within:border-[#b98c49] focus-within:ring-4 focus-within:ring-[#b98c49]/10">
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe3] px-3 py-1.5 text-xs font-brand text-[#8c672f] ring-1 ring-[#d8b77e]/70"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="grid h-4 w-4 place-items-center rounded-full bg-white text-[#b98c49] transition hover:bg-red-50 hover:text-red-600"
                  aria-label={\`Xóa tag \${tag}\`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          value={draft}
          placeholder={tags.length ? "Thêm tag khác..." : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              commitTag();
            }

            if (event.key === "," && draft.trim()) {
              event.preventDefault();
              commitTag();
            }

            if (event.key === "Backspace" && !draft && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => {
            if (draft.trim()) commitTag();
          }}
          className="h-9 w-full bg-transparent text-sm font-normal text-[#3b2a18] outline-none placeholder:text-neutral-400"
        />
      </div>

      <p className="mt-1 text-[11px] font-normal text-[#8c672f]">
        Nhập một tag rồi bấm Enter. Có thể nhập nhiều tag bằng dấu phẩy.
      </p>
    </label>
  );
}

`;

if (!content.includes("function TagInput(")) {
  content = content.replace(marker, tagInputComponent + marker);
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa Tags: bấm Enter sẽ lưu tag, không submit form.");
