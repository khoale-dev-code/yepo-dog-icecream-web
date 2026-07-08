import DogProfileCard from "../../components/public/DogProfileCard";

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

export default function DogsPage({ store }) {
  const dogs = getList(store, "dogs")
    .filter((dog) => dog.isActive !== false)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  return (
    <div className="space-y-8 py-6 sm:py-8">
      <section className="overflow-hidden rounded-[36px] border border-[#ead7b6] bg-white p-6 shadow-[0_20px_60px_rgba(115,81,34,.08)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
          Hồ sơ cún
        </p>
        <h1 className="mt-4 text-4xl font-black text-[#2f2115] sm:text-5xl">
          Tất cả những bé cún của YEPO
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#755b38]">
          Trang này hiển thị toàn bộ hồ sơ cún đang được bật công khai. Các bé nổi bật sẽ được đưa thêm ra trang chủ.
        </p>
      </section>

      {dogs.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {dogs.map((dog) => (
            <DogProfileCard key={dog._id || dog.id} dog={dog} />
          ))}
        </section>
      ) : (
        <section className="rounded-[34px] border border-dashed border-[#ead7b6] bg-white px-6 py-14 text-center">
          <p className="text-lg font-black text-[#2f2115]">
            Chưa có hồ sơ cún công khai.
          </p>
        </section>
      )}
    </div>
  );
}
