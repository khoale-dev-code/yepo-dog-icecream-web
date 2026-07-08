const fs = require("fs");
const path = require("path");

function patchDogManagerView() {
  const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");
  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("const breedSuggestions = useMemo")) {
    content = content.replace(
      `  const personalitySuggestions = useMemo(
    () => collectDogSuggestions(dogs, "personalityTags"),
    [dogs]
  );`,
      `  const personalitySuggestions = useMemo(
    () => collectDogSuggestions(dogs, "personalityTags"),
    [dogs]
  );

  const breedSuggestions = useMemo(() => {
    const values = [];

    dogs.forEach((dog) => {
      String(dog.breed || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.push(item));
    });

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "vi"));
  }, [dogs]);`
    );
  }

  if (!content.includes("breedSuggestions={breedSuggestions}")) {
    content = content.replace(
      `favoriteSuggestions={favoriteSuggestions}
            personalitySuggestions={personalitySuggestions}`,
      `favoriteSuggestions={favoriteSuggestions}
            personalitySuggestions={personalitySuggestions}
            breedSuggestions={breedSuggestions}`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched DogManagerView.jsx");
}

function patchDogEditorPanel() {
  const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");
  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("breedSuggestions = []")) {
    content = content.replace(
      `personalitySuggestions,`,
      `personalitySuggestions,
  breedSuggestions = [],`
    );
  }

  const oldBreedField = `            <Field
              label="Giống / chủng loại"
              value={form.breed}
              placeholder="Poodle, Corgi, Alaska..."
              onChange={(value) => update("breed", value)}
            />`;

  const newBreedField = `            <BreedSuggestionInput
              label="Giống / chủng loại"
              value={form.breed}
              suggestions={breedSuggestions}
              placeholder="Poodle, Corgi, Alaska..."
              onChange={(value) => update("breed", value)}
            />`;

  if (content.includes(oldBreedField)) {
    content = content.replace(oldBreedField, newBreedField);
  }

  if (!content.includes("function BreedSuggestionInput")) {
    const component = `
function BreedSuggestionInput({ label, value, suggestions = [], placeholder, onChange }) {
  const filteredSuggestions = suggestions
    .filter((item) => item.toLowerCase().includes(String(value || "").trim().toLowerCase()))
    .filter((item) => item !== value)
    .slice(0, 8);

  function handleKeyDown(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const nextValue = String(value || "").trim();

    if (nextValue) {
      onChange(nextValue);
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm outline-none focus:border-[#b98c49]"
        list="dog-breed-suggestions"
      />

      <datalist id="dog-breed-suggestions">
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      {filteredSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className="rounded-full border border-[#d8b77e] bg-white px-3 py-1.5 text-xs font-brand text-[#756144] transition hover:bg-[#f7efe3] hover:text-[#8c672f]"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-[11px] text-[#8c672f]">
        Gõ giống mới rồi bấm Enter để dùng. Các giống đã tạo sẽ tự hiện lại ở lần sau.
      </p>
    </label>
  );
}

`;

    content = content.replace("function Field({ label, value, onChange, required, inputMode, placeholder, helper }) {", component + "function Field({ label, value, onChange, required, inputMode, placeholder, helper }) {");
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched DogEditorPanel.jsx");
}

patchDogManagerView();
patchDogEditorPanel();
