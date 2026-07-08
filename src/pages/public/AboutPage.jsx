import React from 'react';
import { MapPin, Phone, Clock, Heart, Sparkles, IceCream, PawPrint } from 'lucide-react';

const MASCOT_IMAGE_URL = "https://instagram.fsgn2-10.fna.fbcdn.net/v/t51.82787-15/683789115_17872094964606126_6428776561352595400_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=Mzg4NTgwMDA2NzQ2NzEzMjAxOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vngeoBahMs0Q7kNvwGKs0Zo&_nc_oc=AdoysAORz18oKzgzZF_RlbQZ2C9aBk6zdSOlwS8kzubyGmfEkVvdomeXKgmQZJwRt19SL4l3NIVIPZqKanfqFeqi&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fsgn2-10.fna&_nc_gid=XRNJk382nM7IPqqKvUlr_Q&_nc_ss=7a22e&oh=00_AQAZ_KeAAOHGMaKorh3c7z_ri30YF5qc-bKU-LKoP2AZLA&oe=6A513DFF";

export default function YepoBentoLanding() {
  return (
    <div className="min-h-screen bg-[#FFFAFA] p-4 sm:p-6 md:p-8 font-sans text-[#4A3320] selection:bg-[#f6d77d] selection:text-[#4A3320]">
      
      {/* Container chính */}
      <div className="mx-auto max-w-7xl">
        
        {/* Header nhẹ nhàng */}
        <header className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <PawPrint className="text-[#b98c49] animate-bounce" size={28} />
            <h1 className="text-2xl font-black tracking-tight text-[#4A3320]">YEPO</h1>
          </div>
          <p className="hidden sm:block text-sm font-medium text-[#b98c49] bg-[#f6d77d]/20 px-4 py-1.5 rounded-full">
            Ice Cream & Pet Cafe
          </p>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* KHỐI 1: HERO COPY (Chiếm 8 cột trên Desktop) */}
          <div className="md:col-span-8 bg-gradient-to-br from-[#f6d77d]/30 to-[#f6d77d]/10 rounded-[32px] p-8 sm:p-10 md:p-12 flex flex-col justify-center relative overflow-hidden group border border-[#f6d77d]/40 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 text-[#f6d77d]/40 opacity-50 group-hover:rotate-12 transition-transform duration-700">
              <Sparkles size={180} />
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-[#b98c49] text-xs sm:text-sm font-bold shadow-sm mb-6 border border-[#b98c49]/10">
                <Heart size={14} className="fill-current" />
                Trạm sạc cảm xúc giữa lòng Sài Gòn
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4A3320] leading-[1.15] mb-6 tracking-tight">
                Không chỉ là kem.<br />
                Là thế giới của những <span className="text-[#b98c49] relative whitespace-nowrap">
                  "Idol bốn chân"
                  <svg className="absolute -bottom-2 w-full left-0 text-[#f6d77d]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="3" fill="transparent"/>
                  </svg>
                </span>
              </h2>
              
              <p className="text-base md:text-lg text-[#6B4E31] leading-relaxed font-medium mb-8 max-w-xl">
                Bỏ lại những muộn phiền ngoài kia. Bước qua cánh cửa YEPO để để vị ngọt mát của kem tan trên đầu lưỡi, và để trái tim bạn tan chảy trước ánh mắt tròn xoe, cái đuôi ngoe nguẩy của dàn nhân viên "lắm lông" nhiệt huyết nhất hệ mặt trời. 🐾
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="tel:0961229449" className="inline-flex items-center justify-center gap-2 bg-[#b98c49] text-white px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base hover:bg-[#4A3320] transition-colors shadow-lg shadow-[#b98c49]/30">
                  <Phone size={18} />
                  Gọi đặt bàn ngay
                </a>
              </div>
            </div>
          </div>

          {/* KHỐI 2: ẢNH IDOL (Chiếm 4 cột trên Desktop) */}
          <div className="md:col-span-4 bg-[#b98c49] rounded-[32px] relative overflow-hidden group min-h-[300px] md:min-h-full shadow-md">
            {MASCOT_IMAGE_URL ? (
              <img 
                src={MASCOT_IMAGE_URL} 
                alt="Idol YEPO" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#b98c49] to-[#8c672f] flex items-center justify-center">
                <IceCream size={80} className="text-white/50" />
              </div>
            )}
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-[#f6d77d] mb-1">Gương mặt thương hiệu</p>
              <p className="text-lg font-bold leading-tight">Ghé YEPO để nựng tụi mình nha! 🐶</p>
            </div>
          </div>

          {/* KHỐI 3: ENGLISH QUOTE / VIBE (Chiếm 5 cột trên Desktop) */}
          <div className="md:col-span-5 bg-[#4A3320] rounded-[32px] p-8 flex flex-col justify-center relative overflow-hidden text-white shadow-md">
            <IceCream className="absolute -right-6 -bottom-6 text-white/5" size={160} />
            <div className="relative z-10">
              <PawPrint size={32} className="text-[#f6d77d] mb-6 opacity-80" />
              <p className="text-xl md:text-2xl font-semibold leading-relaxed mb-4">
                "An immersive world built around a lineup of energetic and lovable four-legged idols."
              </p>
              <p className="text-[#f6d77d] font-medium text-sm">
                — Thưởng thức kem ngon, ôm trọn bình yên.
              </p>
            </div>
          </div>

          {/* KHỐI 4: LOCATION (Chiếm 4 cột trên Desktop) */}
          <div className="md:col-span-4 bg-white rounded-[32px] p-6 sm:p-8 flex flex-col justify-between border-2 border-[#f6d77d]/30 group hover:border-[#b98c49] transition-colors shadow-sm">
            <div className="bg-[#f6d77d]/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-[#b98c49] group-hover:bg-[#b98c49] group-hover:text-white transition-colors">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#b98c49] uppercase tracking-wider mb-2">Tọa độ</p>
              <h3 className="text-xl font-bold text-[#4A3320] mb-1">237 Bến Vân Đồn</h3>
              <p className="text-[#6B4E31] font-medium text-sm">Phường Vĩnh Hội, TP. Hồ Chí Minh</p>
            </div>
          </div>

          {/* KHỐI 5: WORKING HOURS (Chiếm 3 cột trên Desktop) */}
          <div className="md:col-span-3 bg-[#f6d77d] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between text-[#4A3320] shadow-sm">
            <div className="bg-white/40 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-[#4A3320]">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Giờ đón khách</p>
              <h3 className="text-2xl font-black mb-1">10<span className="text-lg font-bold">am</span> - 21<span className="text-lg font-bold">pm</span></h3>
              <p className="font-medium text-sm opacity-90">Mở cửa mỗi ngày</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}