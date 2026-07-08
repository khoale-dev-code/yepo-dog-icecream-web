const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("CheckCircle")) {
  content = content.replace(
    "Paintbrush,\n} from \"lucide-react\";",
    "Paintbrush,\n  CheckCircle,\n  Video,\n} from \"lucide-react\";"
  );
}

if (!content.includes("function isMediaVideo")) {
  content = content.replace(
    "const THEME_OPTIONS = [",
    `function isMediaVideo(media) {
  const type = String(media?.type || media?.resourceType || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getMediaCoverKey(media) {
  if (media?.source === "new") return \`new:\${media.newIndex}\`;
  return \`existing:\${media.url}\`;
}

const THEME_OPTIONS = [`
  );
}

content = content.replace(
  `return files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type?.startsWith("video/") ? "video" : "image",
      name: file.name,
    }));`,
  `return files.map((file, index) => ({
      url: URL.createObjectURL(file),
      type: file.type?.startsWith("video/") ? "video" : "image",
      resourceType: file.type?.startsWith("video/") ? "video" : "image",
      source: "new",
      newIndex: index,
      name: file.name,
    }));`
);

if (!content.includes("Tự động chọn ảnh đầu tiên làm đại diện")) {
  content = content.replace(
    `  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  function update(field, value) {`,
    `  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  // Tự động chọn ảnh đầu tiên làm đại diện nếu admin chưa chọn.
  useEffect(() => {
    if (form.coverMediaKey) return;

    const firstExistingImage = existingMedia.find((media) => !isMediaVideo(media));

    if (firstExistingImage?.url) {
      update("coverMediaKey", \`existing:\${firstExistingImage.url}\`);
      return;
    }

    const firstNewImage = selectedPreviews.find((media) => !isMediaVideo(media));

    if (firstNewImage) {
      update("coverMediaKey", \`new:\${firstNewImage.newIndex}\`);
    }
  }, [existingMedia, selectedPreviews, form.coverMediaKey]);

  function update(field, value) {`
  );
}

content = content.replaceAll(
  `placeholder="1 - 10"`,
  `placeholder="1 - 100"`
);

content = content.replaceAll(
  `slice(0, 2))}`,
  `slice(0, 3))}`
);

content = content.replaceAll(
  `                  media={{
                    url: media.url,
                    type: media.resourceType === "video" ? "video" : "image",
                    name: media.originalName || "Ảnh hiện tại",
                  }}
                  label="Đã lưu"
                />`,
  `                  media={{
                    url: media.url,
                    type: media.resourceType === "video" ? "video" : "image",
                    resourceType: media.resourceType === "video" ? "video" : "image",
                    source: "existing",
                    name: media.originalName || "Media hiện tại",
                  }}
                  label="Đã lưu"
                  coverMediaKey={form.coverMediaKey}
                  onSelectCover={(key) => update("coverMediaKey", key)}
                />`
);

content = content.replaceAll(
  `<MediaPreview key={media.url} media={media} label={\`Mới #\${index + 1}\`} />`,
  `<MediaPreview
                  key={media.url}
                  media={media}
                  label={\`Mới #\${index + 1}\`}
                  coverMediaKey={form.coverMediaKey}
                  onSelectCover={(key) => update("coverMediaKey", key)}
                />`
);

content = content.replaceAll(
  `onClick={() => setFiles([])}`,
  `onClick={() => {
                setFiles([]);
                if (String(form.coverMediaKey || "").startsWith("new:")) {
                  update("coverMediaKey", "");
                }
              }}`
);

content = content.replace(
  /function MediaPreview\\(\\{ media, label \\}\\) \\{[\\s\\S]*?\\n\\}\\n\\nfunction Toggle/,
  `function MediaPreview({ media, label, coverMediaKey, onSelectCover }) {
  const isVideo = isMediaVideo(media);
  const coverKey = getMediaCoverKey(media);
  const isCover = coverMediaKey === coverKey;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border-2 bg-white transition",
        isCover ? "border-[#58b368] shadow-[0_0_0_4px_rgba(88,179,104,.16)]" : "border-[#e1eaf0]"
      )}
    >
      <div className="relative aspect-square bg-[#f7fafc]">
        {isVideo ? (
          <video src={media.url} muted playsInline controls className="h-full w-full object-cover" />
        ) : (
          <img src={media.url} alt={media.name} className="h-full w-full object-cover" />
        )}

        {isVideo && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Video size={11} />
            Video
          </span>
        )}

        {isCover && (
          <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#58b368] text-white shadow-md">
            <CheckCircle size={17} />
          </span>
        )}
      </div>

      <div className="bg-[#f0f4f7] px-2 py-2">
        <p className="truncate text-center text-[10px] font-bold uppercase tracking-wider text-[#8fa7b8]">
          {label}
        </p>

        {!isVideo ? (
          <button
            type="button"
            onClick={() => onSelectCover(coverKey)}
            className={cn(
              "mt-2 h-9 w-full rounded-xl text-[11px] font-black uppercase tracking-wide transition",
              isCover
                ? "bg-[#58b368] text-white"
                : "bg-white text-[#628296] hover:bg-[#e8f1f5]"
            )}
          >
            {isCover ? "Đang làm đại diện" : "Chọn làm đại diện"}
          </button>
        ) : (
          <p className="mt-2 rounded-xl bg-white px-2 py-2 text-center text-[10px] font-bold text-[#8fa7b8]">
            Video sẽ nằm trong thư viện, không dùng làm ảnh card
          </p>
        )}
      </div>
    </div>
  );
}

function Toggle`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched DogEditorPanel.jsx with video + cover image picker.");
