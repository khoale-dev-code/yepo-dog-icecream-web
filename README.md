<div align="center">

#   YEPO Dog Icecream Web

### Website quản lý & giới thiệu quán **YEPO Dog Icecream**

Không gian cafe thú cưng với menu đồ uống, hồ sơ các bé cún, bài viết, khuyến mãi và đặt bàn trực tuyến.

<br />

![React](https://img.shields.io/badge/React-2026-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

## ✨ Giới thiệu

**YEPO Dog Icecream Web** là website dành cho quán cafe thú cưng, giúp khách hàng xem menu, tìm hiểu các bé cún tại quán, đọc bài viết, xem khuyến mãi và gửi yêu cầu đặt bàn.

Dự án gồm 2 phần chính:

- **Public Website**: giao diện khách hàng.
- **Admin Dashboard**: quản trị menu, cún, bài viết, khuyến mãi, topping, đặt bàn và thông tin cửa hàng.

---

## 🌟 Tính năng chính

### 👥 Khách hàng

- Xem trang chủ giới thiệu quán.
- Xem menu đồ uống / bánh / topping.
- Xem chi tiết sản phẩm.
- Xem hồ sơ các bé cún.
- Xem bài viết và câu chuyện của quán.
- Xem chương trình khuyến mãi.
- Gửi yêu cầu đặt bàn online.

### 🔐 Quản trị viên

- Đăng nhập trang admin.
- Quản lý danh mục menu.
- Quản lý sản phẩm.
- Upload ảnh / video sản phẩm.
- Quản lý topping.
- Quản lý hồ sơ các bé cún.
- Quản lý bài viết.
- Quản lý khuyến mãi.
- Theo dõi và cập nhật trạng thái đặt bàn.
- Cập nhật thông tin cửa hàng.

---

## 🎨 Giao diện

Dự án sử dụng phong cách thiết kế:

- Tone màu chủ đạo: **Caramel Brown `#b98c49`**
- Màu phụ: **Sunny Yellow `#f6d77d`**
- Nền sáng: **Snow White `#FFFAFA`**
- Phong cách: mềm mại, hiện đại, thân thiện với thú cưng.
- Font chính: **Quicksand**, **Fredoka**.

---

## 🛠️ Công nghệ sử dụng

### Frontend

- ReactJS
- Vite
- TailwindCSS v4
- React Router
- Lucide React Icons

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT / Cookie Auth
- Cloudinary Upload

---

## 📁 Cấu trúc thư mục

```txt
yepo-dog-icecream-web/
├── server/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── index.js
│
├── src/
│   ├── admin/
│   │   ├── components/
│   │   ├── views/
│   │   ├── menu/
│   │   ├── dogs/
│   │   ├── posts/
│   │   ├── promotions/
│   │   ├── toppings/
│   │   └── reservations/
│   │
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   └── public/
│   └── main.jsx
│
├── public/
├── package.json
└── README.md
```

---

## ⚙️ Cài đặt dự án

### 1. Clone repository

```bash
git clone https://github.com/khoale-dev-code/yepo-dog-icecream-web.git
cd yepo-dog-icecream-web
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file môi trường

Tạo file `.env` ở thư mục gốc:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> Không commit file `.env` lên GitHub.

---

## 🚀 Chạy dự án

### Chạy frontend

```bash
npm run dev
```

Frontend mặc định chạy tại:

```txt
http://localhost:5173
```

### Chạy backend

```bash
npm run server
```

Backend mặc định chạy tại:

```txt
http://localhost:4000
```

### Build production

```bash
npm run build
```

---

## 🔐 Trang quản trị

Truy cập:

```txt
http://localhost:5173/admin
```

Đăng nhập bằng tài khoản được cấu hình trong `.env`.

---

## 📌 Các route chính

### Public

```txt
/
 /menu
 /menu/:productId
 /dogs
 /posts
 /promotions
```

### Admin

```txt
/admin
```

### API

```txt
/api/public-store
/api/shop
/api/products
/api/categories
/api/toppings
/api/dogs
/api/posts
/api/promotions
/api/reservations
/api/upload
```

---

## 🧩 Ghi chú vận hành

- Sản phẩm muốn hiển thị ở trang chủ cần bật trạng thái **Món nổi bật**.
- Bài viết muốn hiển thị ở homepage cần bật trạng thái **Ghim bài viết**.
- Hồ sơ cún muốn hiển thị ở homepage cần bật trạng thái **Nổi bật**.
- Homepage chỉ hiển thị một số nội dung chọn lọc để tối ưu tốc độ tải.
- Trang `/menu` là nơi hiển thị đầy đủ sản phẩm.

---

## 🖼️ Upload media

Dự án hỗ trợ upload ảnh / video thông qua Cloudinary.

Các loại media thường dùng:

- Ảnh sản phẩm.
- Video sản phẩm.
- Ảnh hồ sơ cún.
- Ảnh bài viết.
- Ảnh khuyến mãi.
- Logo / ảnh cửa hàng.

---

## 🧪 Kiểm tra nhanh

```bash
npm run build
```

Nếu build thành công, dự án đã sẵn sàng để deploy.

---

## 📦 Deploy gợi ý

Có thể deploy theo hướng:

- Frontend: Vercel / Netlify.
- Backend: Render / Railway.
- Database: MongoDB Atlas.
- Media: Cloudinary.

---

## 👨‍💻 Repository

```txt
https://github.com/khoale-dev-code/yepo-dog-icecream-web
```

---

<div align="center">

Made with ☕, 🐾 and caramel vibes for **YEPO Dog Icecream**

</div>
