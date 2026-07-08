import {
  ArrowRight,
  Heart,
  PawPrint,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DogProfileCard from "../../components/public/DogProfileCard";

const PAGE_SIZE = 12;

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getDogSearchText(dog) {
  return [
    dog?.name,
    dog?.nickname,
    dog?.breed,
    dog?.gender,
    dog?.personality,
    dog?.favoriteTreat,
    ...(Array.isArray(dog?.personalityTags) ? dog.personalityTags : []),
    ...(Array.isArray(dog?.favoriteTreats) ? dog.favoriteTreats : []),
  ]
    .filter(Boolean)
    .join(" ");
}

export default function DogsPage({ store }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const dogs = useMemo(() => {
    return getList(store, "dogs")
      .filter((dog) => dog.isActive !== false)
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  }, [store]);

  const filteredDogs = useMemo(() => {
    const keyword = normalizeText(query);

    if (!keyword) return dogs;

    return dogs.filter((dog) =>
      normalizeText(getDogSearchText(dog)).includes(keyword)
    );
  }, [dogs, query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visibleDogs = filteredDogs.slice(0, visibleCount);
  const featuredCount = dogs.filter((dog) => dog.isFeatured === true).length;
  const hasMore = visibleCount < filteredDogs.length;

  function handleLoadMore() {
    setVisibleCount((current) => current + PAGE_SIZE);
  }

  return (
    <div className="space-y-6 px-3 py-5 sm:px-0 sm:py-8">
      <section className="relative overflow-hidden rounded-[30px] border border-[#ead7b6] bg-white p-5 shadow-[0_18px_54px_rgba(115,81,34,.08)] sm:rounded-[36px] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f6d77d]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#b98c49]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b98c49] ring-1 ring-[#ead7b6]">
            <PawPrint size={14} />
            Hồ sơ cún
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight text-[#2f2115] sm:text-5xl">
                Tất cả những bé cún của YEPO
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#755b38] sm:text-base">
                Xem hồ sơ, tính cách và những điều đáng yêu của các bé cún đang được bật công khai tại YEPO.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <InfoPill icon={PawPrint} label="Tổng hồ sơ" value={dogs.length} />
              <InfoPill icon={Heart} label="Nổi bật" value={featuredCount} />
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#ead7b6] bg-[#FFFAFA] p-3 sm:max-w-xl">
            <label className="flex h-12 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-[#ead7b6]/70 focus-within:ring-2 focus-within:ring-[#b98c49]/40">
              <Search size={18} className="shrink-0 text-[#b98c49]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, giống, tính cách..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#2f2115] outline-none placeholder:text-[#a58a65]"
              />
            </label>
          </div>
        </div>
      </section>

      {dogs.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                Danh sách cún
              </p>
              <p className="mt-1 text-sm font-semibold text-[#755b38]">
                Đang hiển thị {visibleDogs.length}/{filteredDogs.length} hồ sơ
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#8c672f] shadow-sm ring-1 ring-[#ead7b6] sm:inline-flex">
              <Sparkles size={14} />
              YEPO friends
            </div>
          </div>

          {filteredDogs.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {visibleDogs.map((dog) => (
                  <div
                    key={dog._id || dog.id || dog.name}
                    className="min-w-0 rounded-[32px]"
                  >
                    <DogProfileCard dog={dog} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(185,140,73,0.22)] transition hover:bg-[#8c672f] sm:w-auto"
                  >
                    Xem thêm 12 bé
                    <ArrowRight size={16} />
                  </button>

                  <p className="mt-3 text-xs font-semibold text-[#a58a65]">
                    Còn {filteredDogs.length - visibleDogs.length} hồ sơ chưa hiển thị.
                  </p>
                </div>
              )}
            </>
          ) : (
            <section className="rounded-[30px] border border-dashed border-[#ead7b6] bg-white px-6 py-12 text-center">
              <Search size={38} className="mx-auto text-[#b98c49]" />
              <p className="mt-4 text-lg font-black text-[#2f2115]">
                Không tìm thấy bé cún phù hợp.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-5 text-sm font-bold text-white"
              >
                Xóa tìm kiếm
                <ArrowRight size={15} />
              </button>
            </section>
          )}
        </section>
      ) : (
        <section className="rounded-[30px] border border-dashed border-[#ead7b6] bg-white px-6 py-14 text-center shadow-sm">
          <PawPrint size={42} className="mx-auto text-[#b98c49]" />
          <p className="mt-4 text-lg font-black text-[#2f2115]">
            Chưa có hồ sơ cún công khai.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#755b38]">
            Vào admin và bật trạng thái công khai cho hồ sơ cún để hiển thị tại đây.
          </p>
        </section>
      )}
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-[#ead7b6] bg-[#FFFAFA] p-3 text-center shadow-sm sm:min-w-[130px] sm:text-left">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#f6d77d]/45 text-[#b98c49] sm:mx-0">
        <Icon size={17} />
      </div>
      <p className="mt-2 text-2xl font-black leading-none text-[#2f2115]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b98c49]">
        {label}
      </p>
    </div>
  );
}
