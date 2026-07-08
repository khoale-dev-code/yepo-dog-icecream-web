const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

function findFunctionEnd(source, functionName) {
  const start = source.indexOf("function " + functionName);
  if (start === -1) return -1;

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) return -1;

  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;

    if (depth === 0) return i + 1;
  }

  return -1;
}

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf("function " + functionName);
  if (start === -1) {
    throw new Error("Không tìm thấy function " + functionName);
  }

  const end = findFunctionEnd(source, functionName);
  if (end === -1) {
    throw new Error("Không tìm thấy điểm kết thúc function " + functionName);
  }

  return source.slice(0, start) + replacement + source.slice(end);
}

/* 1) Thêm helper rút gọn mô tả sản phẩm */
if (!content.includes("function getShortDescription")) {
  const formatPriceEnd = findFunctionEnd(content, "formatPrice");

  if (formatPriceEnd === -1) {
    throw new Error("Không tìm thấy function formatPrice");
  }

  const helper = `

function getShortDescription(value, wordLimit = 8) {
  const text = String(value || "")
    .replace(/\\s+/g, " ")
    .trim();

  if (!text) return "Xem chi tiết để biết thêm.";

  const words = text.split(" ").filter(Boolean);

  if (words.length <= wordLimit) return text;

  return words.slice(0, wordLimit).join(" ") + "...";
}
`;

  content = content.slice(0, formatPriceEnd) + helper + content.slice(formatPriceEnd);
}

/* 2) Ghi lại SignatureMenuCard: homepage chỉ hiện mô tả ngắn */
const newSignatureMenuCard = `function SignatureMenuCard({ product, index }) {
  const shortDescription = getShortDescription(
    product.description || "Hương vị đặc trưng chỉ có tại YEPO.",
    8
  );

  return (
    <Link
      to={getProductPath(product)}
      className="group flex min-w-[84vw] snap-start flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_38px_rgba(185,140,73,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_20px_55px_rgba(185,140,73,0.16)] sm:min-w-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[#b98c49]/10 bg-[#FFFAFA] p-6">
        <img
          src={getMedia(product)}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#2D2D2D] shadow-sm ring-1 ring-[#b98c49]/15">
          {product.category || product.categoryId?.name || "Signature"}
        </div>

        <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#f6d77d] text-sm font-['Fredoka'] font-bold text-[#8c672f] shadow-sm">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="min-h-[64px] text-2xl font-['Quicksand'] font-bold leading-tight text-[#2D2D2D]">
          {product.name}
        </h3>

        <p className="mt-3 min-h-[48px] text-[15px] font-medium leading-7 text-[#666666]">
          {shortDescription}
        </p>

        <p className="mt-2 text-xs font-['Quicksand'] font-bold uppercase tracking-[0.12em] text-[#b98c49]/80">
          Xem chi tiết để đọc đầy đủ
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <span className="min-w-0 text-xl font-['Fredoka'] font-semibold text-[#2D2D2D]">
            {formatPrice(product.price)}
          </span>

          <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f6d77d]/35 px-5 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white">
            Xem chi tiết
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

`;

content = replaceFunction(content, "SignatureMenuCard", newSignatureMenuCard);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa homepage: mô tả món chỉ hiện vài từ, bản đầy đủ nằm ở trang chi tiết.");
