const fs = require("fs");
const path = require("path");

const appPath = path.resolve(process.cwd(), "src/App.jsx");

let content = fs.readFileSync(appPath, "utf8");

if (!content.includes('useSnackbar')) {
  content = content.replace(
    'import { api } from "./lib/api";',
    'import { api } from "./lib/api";\nimport { useSnackbar } from "./components/ui/SnackbarProvider";'
  );
}

if (
  content.includes("function ReservationSection({ shop }) {") &&
  !content.includes("const toast = useSnackbar();")
) {
  content = content.replace(
    "function ReservationSection({ shop }) {",
    "function ReservationSection({ shop }) {\n  const toast = useSnackbar();"
  );
}

if (!content.includes('toast.success("YEPO đã nhận thông tin đặt bàn của bạn."')) {
  content = content.replace(
    'setStatus("success");',
    'setStatus("success");\n      toast.success("YEPO đã nhận thông tin đặt bàn của bạn.", "Đặt bàn thành công");'
  );
}

if (!content.includes('toast.error("Chưa gửi được đặt bàn. Vui lòng thử lại."')) {
  content = content.replace(
    'setStatus("error");',
    'setStatus("error");\n      toast.error("Chưa gửi được đặt bàn. Vui lòng thử lại.", "Đặt bàn thất bại");'
  );
}

fs.writeFileSync(appPath, content, "utf8");

console.log("Patched src/App.jsx with reservation snackbar.");
