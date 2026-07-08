const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. Thêm helper để tránh lấy video làm ảnh card món
if (!content.includes("function isVideoMedia")) {
  content = content.replace(
    `function getShop(store) {
  return store?.shop || store?.data?.shop || {};
}

function getMedia(item) {`,
    `function getShop(store) {
  return store?.shop || store?.data?.shop || {};
}

function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getMedia(item) {`
  );
}

// 2. Thay getMedia để ưu tiên imageUrl hoặc ảnh/GIF, không lấy video làm ảnh card
const getMediaStart = content.indexOf("function getMedia(item) {");
const getMediaEnd = content.indexOf("function formatPrice", getMediaStart);

if (getMediaStart !== -1 && getMediaEnd !== -1) {
  const nextGetMedia = `function getMedia(item) {
  if (item?.imageUrl) return item.imageUrl;

  if (Array.isArray(item?.media) && item.media.length > 0) {
    const firstImage = item.media.find((media) => !isVideoMedia(media));
    if (firstImage?.url) return firstImage.url;
  }

  return "https://dummyimage.com/800x600/FFF5EB/B88046.png&text=YEPO";
}

`;

  content =
    content.slice(0, getMediaStart) +
    nextGetMedia +
    content.slice(getMediaEnd);
}

// 3. Đổi khung ảnh món ngon nổi bật từ object-cover sang object-contain để thấy đủ hình
const oldProductImageBlock = `              <div className="relative border-b-2 border-[#B88046] p-1.5 bg-[#FFF5EB]">
                <img
                  src={getMedia(product)}
                  alt={product.name}
                  className="h-48 w-full rounded-[20px] object-cover"
                />
              </div>`;

const newProductImageBlock = `              <div className="relative border-b-2 border-[#B88046] bg-[#FFF5EB] p-2">
                <div className="aspect-[4/3] overflow-hidden rounded-[22px] bg-white">
                  <img
                    src={getMedia(product)}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </div>`;

if (content.includes(oldProductImageBlock)) {
  content = content.replace(oldProductImageBlock, newProductImageBlock);
} else {
  console.log("Không tìm thấy block ảnh cũ. Kiểm tra lại HomePage.jsx nếu ảnh chưa đổi.");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Updated HomePage menu cards: product images now show full image.");
