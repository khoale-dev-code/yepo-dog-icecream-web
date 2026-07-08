# YEPO Dog & Ice Cream Web

Website hiện đại cho shop quán nước/kem theo concept **YEPO Dog & Ice Cream**. Project dùng:

- Frontend: React + Vite + Tailwind CSS v4
- Backend: Express API
- Database: MongoDB + Mongoose
- Media storage: Cloudinary signed upload
- Map: Google Maps iframe + nút mở chỉ đường

## Điểm đã làm

- Landing page responsive cho khách hàng.
- Hero theo brand Dog & Ice Cream.
- Menu sản phẩm có filter category, search, sale tag, featured tag.
- Khu vực lịch gặp cún và lưu ý vận hành.
- Google Maps embed cho địa chỉ 237 Bến Vân Đồn, P. Vĩnh Hội, TP.HCM.
- Link Instagram `https://www.instagram.com/yepo.dog.icecream`.
- Admin quick-create tại `/admin`: upload ảnh/video lên Cloudinary rồi lưu sản phẩm vào MongoDB.
- API CRUD cơ bản cho sản phẩm.
- Fallback data để frontend vẫn hiển thị đẹp khi chưa cấu hình MongoDB/API.

## Cài đặt

```bash
npm install
cp .env.example .env
```

Điền các biến môi trường trong `.env`:

```env
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=yepo-dog-icecream
VITE_API_URL=http://localhost:4000/api
```

## Chạy dev

```bash
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:4000/api/health`

## Seed dữ liệu mẫu

```bash
npm run seed
```

## API chính

### Shop

- `GET /api/shop`
- `PATCH /api/shop`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Upload Cloudinary

- `POST /api/upload`
- Form field: `files`
- Hỗ trợ ảnh/video, tối đa 8 file, mỗi file tối đa 25MB.

## Gợi ý triển khai thật

1. Thêm authentication cho `/admin` trước khi public.
2. Thêm collection `categories`, `promotions`, `reservations` nếu cần tính năng booking/khuyến mãi.
3. Dùng Cloudinary transformations để tạo thumbnail tối ưu cho mobile.
4. Thêm SEO route riêng cho từng sản phẩm nếu cần chạy ads/Google search.
5. Khi deploy frontend/backend tách riêng, cập nhật `CLIENT_ORIGIN` và `VITE_API_URL`.
