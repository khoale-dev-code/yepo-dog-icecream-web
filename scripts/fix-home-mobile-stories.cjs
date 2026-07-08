const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

const storiesStart = content.indexOf(
  `      <div className="mx-4 space-y-10 sm:mx-8 lg:mx-12">
        <SectionHeader
          eyebrow="Our Stories"`
);

if (storiesStart === -1) {
  throw new Error("Không tìm thấy section Our Stories.");
}

const reservationStart = content.indexOf(
  `

      <ReservationSection shop={shop} scrollY={scrollY} />`,
  storiesStart
);

if (reservationStart === -1 || reservationStart <= storiesStart) {
  throw new Error("Không tìm thấy ReservationSection sau Our Stories.");
}

const newStoriesSection = String.raw`      <div className="mx-4 space-y-6 sm:mx-8 sm:space-y-10 lg:mx-12">
        <SectionHeader
          eyebrow="Our Stories"
          title="Góc chuyện trò"
          description="Những mẩu chuyện nhỏ, thông báo sự kiện và khoảnh khắc đáng yêu tại quán."
          action={<LinkButton to="/posts">Xem tất cả bài viết</LinkButton>}
        />

        {posts.length > 0 ? (
          <>
            {/* Mobile: story card kéo ngang, gọn và dễ lướt */}
            <section className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:hidden">
              {posts.map((post, index) => (
                <Reveal
                  key={post._id || post.id || post.title}
                  delay={index * 100}
                  as="article"
                  className="min-w-[82vw] max-w-[350px] snap-start overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_34px_rgba(185,140,73,0.1)]"
                >
                  <Link to="/posts" className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#FFFAFA]">
                      <img
                        src={getMedia(post)}
                        alt={post.title || "Bài viết YEPO"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#b98c49] shadow-sm">
                        Chuyện YEPO
                      </div>

                      <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[#f6d77d] text-[#8c672f] shadow-sm">
                        <Sparkles size={17} />
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                        Story #{String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-2 line-clamp-2 min-h-[56px] text-xl font-['Quicksand'] font-bold leading-tight text-[#2D2D2D]">
                        {post.title || "Tiêu đề bài viết"}
                      </h3>

                      <p className="mt-3 line-clamp-3 min-h-[66px] text-sm leading-6 text-[#666666]">
                        {post.content || post.caption || "Nội dung đang cập nhật..."}
                      </p>

                      <div className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#f6d77d]/35 px-5 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white">
                        Đọc tiếp
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </section>

            {posts.length > 1 && (
              <div className="-mt-4 flex items-center justify-between rounded-2xl border border-[#b98c49]/10 bg-white px-4 py-3 text-xs font-['Quicksand'] font-bold text-[#8c672f] shadow-sm lg:hidden">
                <span>Lướt sang phải để xem thêm câu chuyện</span>
                <ArrowRight size={15} />
              </div>
            )}

            {/* Desktop: giữ bố cục 2 cột như cũ */}
            <section className="hidden gap-8 lg:grid lg:grid-cols-2">
              {posts.map((post, index) => (
                <Reveal
                  key={post._id || post.id || post.title}
                  delay={index * 120}
                  as="article"
                  className="group flex flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white shadow-sm transition-all duration-300 hover:border-[#b98c49]/50 hover:shadow-[0_10px_30px_rgba(185,140,73,0.1)] sm:flex-row"
                >
                  <div className="relative overflow-hidden border-b border-[#b98c49]/10 sm:w-1/2 sm:border-b-0 sm:border-r">
                    <img
                      src={getMedia(post)}
                      alt={post.title}
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:w-1/2 sm:p-8">
                    <p className="text-[11px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#b98c49]">
                      Chuyện nhà YEPO
                    </p>
                    <h3 className="mt-3 text-xl font-['Quicksand'] font-bold leading-snug text-[#2D2D2D]">
                      {post.title || "Tiêu đề bài viết"}
                    </h3>
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#666666]">
                      {post.content || post.caption || "Nội dung đang cập nhật..."}
                    </p>
                    <Link
                      to="/posts"
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-opacity hover:opacity-70"
                    >
                      Đọc tiếp <ArrowRight size={16} />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </section>
          </>
        ) : (
          <Reveal
            as="section"
            className="rounded-[2rem] border-2 border-dashed border-[#b98c49]/25 bg-white px-6 py-12 text-center"
          >
            <Sparkles size={38} className="mx-auto text-[#b98c49]" />
            <h3 className="mt-4 text-xl font-bold text-[#2D2D2D]">
              Chưa có bài viết ghim
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#666666]">
              Vào admin và ghim tối đa 2 bài muốn hiển thị ở homepage.
            </p>
          </Reveal>
        )}
      </div>`;

content =
  content.slice(0, storiesStart) +
  newStoriesSection +
  content.slice(reservationStart);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cải thiện Our Stories ở mobile: card story kéo ngang, desktop giữ nguyên.");
