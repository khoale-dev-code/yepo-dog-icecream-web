import { Instagram, MapPin, Phone } from "lucide-react";

export default function PublicFooter({ shop }) {
  return (
    <footer className="border-t border-[#ead7b6] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#b98c49]">
            YEPO Dog & Ice Cream
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#3a2a1b]">
            {shop?.name || "YEPO Dog & Ice Cream"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#755b38]">
            {shop?.description ||
              "Một không gian dễ thương cho những ai yêu cún, yêu kem và yêu những buổi hẹn nhẹ nhàng."}
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold text-[#3a2a1b]">Liên hệ</h4>
          <div className="mt-4 space-y-3 text-sm text-[#755b38]">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-[#b98c49]" />
              <span>{shop?.address || "Địa chỉ đang cập nhật..."}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-[#b98c49]" />
              <span>{shop?.phone || "SĐT đang cập nhật..."}</span>
            </p>
            <p className="flex items-center gap-2">
              <Instagram size={16} className="text-[#b98c49]" />
              <span>{shop?.instagram || "@yepo.dog.icecream"}</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-[#3a2a1b]">
            Đặt bàn nhanh
          </h4>
          <p className="mt-3 text-sm leading-7 text-[#755b38]">
            Bạn có thể đặt bàn ngay từ nút trên thanh điều hướng hoặc nhắn tin qua Instagram để YEPO giữ chỗ cho bạn.
          </p>
          <a
            href="/#reservation"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-[#b98c49] px-5 text-sm font-medium text-white transition hover:bg-[#9c7439]"
          >
            Đặt bàn ngay
          </a>
        </div>
      </div>
    </footer>
  );
}