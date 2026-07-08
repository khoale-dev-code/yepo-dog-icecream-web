const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogListPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/*
  Sửa các biến style bị script client chèn nhầm vào admin.
  Trong DogListPanel hiện đúng phải là:
  - cardStyle
  - frameStyle
  - imageRingStyle
*/
content = content
  .replaceAll("style={dogCardStyle}", "style={cardStyle}")
  .replaceAll("style={dogFrameStyle}", "style={frameStyle}")
  .replaceAll("style={dogImageStyle}", "style={imageRingStyle}")
  .replaceAll("style={clientDogCardStyle}", "style={cardStyle}")
  .replaceAll("style={clientDogFrameStyle}", "style={frameStyle}")
  .replaceAll("style={clientDogImageStyle}", "style={imageRingStyle}");

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa DogListPanel: dogFrameStyle undefined -> frameStyle.");
