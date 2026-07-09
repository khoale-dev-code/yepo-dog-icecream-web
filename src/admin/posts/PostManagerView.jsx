import {
  Loader2,
  Newspaper,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { PostComposer } from "./PostComposer.jsx";
import { PostList } from "./PostList.jsx";
import {
  EMPTY_POST_FORM,
  buildPostPayload,
  createPost,
  deletePost,
  getId,
  getPostContent,
  makeDraftFromSavedMedia,
  normalizePostMedia,
  requestPosts,
  revokeDraftUrls,
  updatePost,
  uploadDraftMedia,
} from "./postUtils";

export function PostManagerView() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_POST_FORM,
    order: "1",
  }));
  const [mediaDrafts, setMediaDrafts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [viewer, setViewer] = useState({ media: [], index: null });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter(
        (post) => post.isPublished !== false && post.isActive !== false
      ).length,
      hidden: posts.filter(
        (post) => post.isPublished === false || post.isActive === false
      ).length,
      pinned: posts.filter((post) => post.isPinned === true).length,
      media: posts.filter((post) => normalizePostMedia(post.media).length > 0)
        .length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return posts
      .filter((post) => {
        const content = getPostContent(post).toLowerCase();
        const published =
          post.isPublished !== false && post.isActive !== false;
        const media = normalizePostMedia(post.media);

        const matchQuery =
          !keyword ||
          content.includes(keyword) ||
          String(post.title || "").toLowerCase().includes(keyword);

        const matchStatus =
          status === "all" ||
          (status === "published" && published) ||
          (status === "hidden" && !published) ||
          (status === "pinned" && post.isPinned === true) ||
          (status === "media" && media.length > 0);

        return matchQuery && matchStatus;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const sortA = Number(a.order || a.sortOrder || 999);
        const sortB = Number(b.order || b.sortOrder || 999);

        if (sortA !== sortB) return sortA - sortB;

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [posts, query, status]);

  useEffect(() => {
    loadPosts();

    return () => {
      revokeDraftUrls(mediaDrafts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPosts({ silent = false } = {}) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await requestPosts(api);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không tải được bài đăng.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function resetForm() {
    revokeDraftUrls(mediaDrafts);

    setForm({
      ...EMPTY_POST_FORM,
      order: String(posts.length + 1),
    });
    setMediaDrafts([]);
    setEditingPost(null);
  }

  function openEdit(post) {
    revokeDraftUrls(mediaDrafts);

    setEditingPost(post);
    setForm({
      content: getPostContent(post),
      isPublished: post.isPublished !== false && post.isActive !== false,
      isPinned: post.isPinned === true,
      order: String(post.order || post.sortOrder || 999),
    });
    setMediaDrafts(normalizePostMedia(post.media).map(makeDraftFromSavedMedia));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.content.trim() && mediaDrafts.length === 0) {
      alert("Vui lòng nhập nội dung hoặc thêm media.");
      return;
    }

    try {
      setSubmitting(true);
      setNotice({ type: "", text: "" });

      const media = await uploadDraftMedia(api, mediaDrafts);
      const payload = buildPostPayload({
        form,
        media,
        orderFallback: editingPost
          ? editingPost.order || 999
          : posts.length + 1,
      });

      if (editingPost) {
        await updatePost(api, getId(editingPost), payload);
        setNotice({ type: "success", text: "Đã cập nhật bài đăng." });
      } else {
        await createPost(api, payload);
        setNotice({
          type: "success",
          text: payload.isPublished
            ? "Đã đăng bài."
            : "Đã lưu bài ở trạng thái ẩn.",
        });
      }

      resetForm();
      await loadPosts({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không lưu được bài đăng.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(post) {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) return;

    try {
      await deletePost(api, getId(post));
      setNotice({ type: "success", text: "Đã xóa bài đăng." });
      await loadPosts({ silent: true });

      if (editingPost && getId(editingPost) === getId(post)) {
        resetForm();
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không xóa được bài đăng.",
      });
    }
  }

  async function handleTogglePublished(post) {
    try {
      const currentPublished =
        post.isPublished !== false && post.isActive !== false;

      const payload = buildPostPayload({
        form: {
          content: getPostContent(post),
          isPublished: !currentPublished,
          isPinned: post.isPinned === true,
          order: post.order || post.sortOrder || 999,
        },
        media: normalizePostMedia(post.media),
        orderFallback: post.order || post.sortOrder || 999,
      });

      await updatePost(api, getId(post), payload);
      await loadPosts({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không đổi được trạng thái bài đăng.",
      });
    }
  }

  async function handleTogglePinned(post) {
    try {
      const payload = buildPostPayload({
        form: {
          content: getPostContent(post),
          isPublished: post.isPublished !== false && post.isActive !== false,
          isPinned: !post.isPinned,
          order: post.order || post.sortOrder || 999,
        },
        media: normalizePostMedia(post.media),
        orderFallback: post.order || post.sortOrder || 999,
      });

      await updatePost(api, getId(post), payload);
      await loadPosts({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không cập nhật ghim bài.",
      });
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#d8b77e] bg-white px-5 py-4 text-sm font-bold text-[#8c672f] shadow-[0_14px_40px_rgba(87,61,28,.06)]">
          <Loader2 size={20} className="animate-spin" />
          Đang tải bài đăng...
        </div>
      </div>
    );
  }

  return (
    <div
      data-admin-post-page="true"
      className="mx-auto w-full max-w-7xl space-y-4 overflow-x-hidden px-0 pb-0 sm:space-y-5 sm:pb-0"
    >
      <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4 shadow-[0_18px_54px_rgba(87,61,28,.07)] sm:rounded-[34px] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70 sm:px-4 sm:text-xs">
              <Newspaper size={15} />
              Bài đăng
            </p>

            <h1 className="font-sniglet mt-3 text-3xl leading-tight text-[#3b2a18] sm:mt-4 sm:text-5xl">
              Bản tin YEPO
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#756144] sm:mt-3">
              Đăng món mới, ưu đãi, hình ảnh không gian hoặc thông báo nhanh
              cho khách hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPosts({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_12px_28px_rgba(185,140,73,.2)] transition hover:bg-[#8c672f] disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>
      </section>

      {notice.text && (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm",
            notice.type === "error"
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-emerald-100 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {notice.text}
        </div>
      )}

      <MobileStatStrip stats={stats} />

      <section className="hidden gap-4 sm:grid sm:grid-cols-5">
        <MiniStat label="Tổng bài" value={stats.total} />
        <MiniStat label="Đang hiện" value={stats.published} />
        <MiniStat label="Đang ẩn" value={stats.hidden} />
        <MiniStat label="Đã ghim" value={stats.pinned} />
        <MiniStat label="Có media" value={stats.media} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-w-0 space-y-5">
          <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_14px_44px_rgba(87,61,28,.06)] sm:rounded-[32px]">
            <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-[#3b2a18]">
                {editingPost ? "Chỉnh sửa bài đăng" : "Tạo bài đăng mới"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#756144]">
                Thêm nội dung, hình ảnh/video và chọn trạng thái hiển thị.
              </p>
            </div>

            <div className="p-3 sm:p-5">
              <PostComposer
                form={form}
                setForm={setForm}
                mediaDrafts={mediaDrafts}
                setMediaDrafts={setMediaDrafts}
                editing={Boolean(editingPost)}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancelEdit={resetForm}
              />
            </div>
          </section>

          <div className="xl:hidden">
            <PreviewPanel form={form} mediaDrafts={mediaDrafts} compact />
          </div>

          <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_14px_44px_rgba(87,61,28,.06)] sm:rounded-[32px]">
            <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-[#3b2a18]">
                Danh sách bài đăng
              </p>
              <p className="mt-1 text-xs leading-5 text-[#756144]">
                Tìm kiếm, chỉnh sửa, ghim hoặc ẩn bài đăng đã tạo.
              </p>
            </div>

            <div className="p-3 sm:p-5">
              <PostList
                posts={filteredPosts}
                query={query}
                setQuery={setQuery}
                status={status}
                setStatus={setStatus}
                onEdit={openEdit}
                onDelete={handleDelete}
                onTogglePublished={handleTogglePublished}
                onTogglePinned={handleTogglePinned}
                viewer={viewer}
                setViewer={setViewer}
              />
            </div>
          </section>

          <div className="xl:hidden">
            <GuidePanel compact />
          </div>
        </main>

        <aside className="hidden space-y-4 xl:sticky xl:top-24 xl:block xl:self-start">
          <PreviewPanel form={form} mediaDrafts={mediaDrafts} />
          <GuidePanel />
        </aside>
      </div>
    </div>
  );
}

function MobileStatStrip({ stats }) {
  const items = [
    { label: "Tổng", value: stats.total },
    { label: "Hiện", value: stats.published },
    { label: "Ẩn", value: stats.hidden },
    { label: "Ghim", value: stats.pinned },
    { label: "Media", value: stats.media },
  ];

  return (
    <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-[92px] shrink-0 rounded-[20px] border border-[#d8b77e]/80 bg-white p-3 shadow-[0_10px_26px_rgba(87,61,28,.05)]"
        >
          <p className="text-[10px] font-brand uppercase tracking-[0.12em] text-[#b98c49]">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-black text-[#3b2a18]">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[#d8b77e]/80 bg-white p-4 shadow-[0_12px_32px_rgba(87,61,28,.05)]">
      <p className="text-xs font-brand uppercase tracking-[0.12em] text-[#b98c49]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#3b2a18]">{value}</p>
    </div>
  );
}

function PreviewPanel({ form, mediaDrafts, compact = false }) {
  const firstMedia = mediaDrafts[0];
  const hasDraft = form.content.trim() || mediaDrafts.length > 0;

  return (
    <section
      className={[
        "rounded-[28px] border border-[#d8b77e]/80 bg-white p-4 shadow-[0_14px_40px_rgba(87,61,28,.05)]",
        compact ? "sm:p-5" : "",
      ].join(" ")}
    >
      <p className="flex items-center gap-2 text-sm font-black text-[#3b2a18]">
        <Sparkles size={17} className="text-[#b98c49]" />
        Preview trước khi đăng
      </p>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-[#d8b77e] bg-[#FFFAFA]">
        {firstMedia && (
          <div className="aspect-[4/3] bg-white sm:aspect-video">
            {firstMedia.type === "video" ? (
              <video
                src={firstMedia.url}
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={firstMedia.url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        <div className="p-4">
          {hasDraft ? (
            <p className="line-clamp-6 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#3b2a18]">
              {form.content.trim() ||
                `${mediaDrafts.length} media đang chờ đăng`}
            </p>
          ) : (
            <p className="text-sm leading-6 text-[#756144]">
              Nhập nội dung hoặc thêm media để xem preview.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f6d77d]/35 px-3 py-1 text-xs font-bold text-[#8c672f]">
              {form.isPublished ? "Công khai" : "Ẩn tạm"}
            </span>

            {form.isPinned && (
              <span className="rounded-full bg-[#f6d77d]/35 px-3 py-1 text-xs font-bold text-[#8c672f]">
                Đã ghim
              </span>
            )}

            {mediaDrafts.length > 0 && (
              <span className="rounded-full bg-[#f6d77d]/35 px-3 py-1 text-xs font-bold text-[#8c672f]">
                {mediaDrafts.length} media
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GuidePanel({ compact = false }) {
  return (
    <section
      className={[
        "rounded-[28px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4",
        compact ? "mb-0" : "",
      ].join(" ")}
    >
      <p className="text-sm font-black text-[#3b2a18]">
        Quy trình gợi ý
      </p>

      <div className="mt-3 space-y-2 text-sm leading-6 text-[#756144]">
        <p className="rounded-2xl bg-white p-3 ring-1 ring-[#d8b77e]/70">
          1. Dòng đầu tiên nên là tiêu đề ngắn.
        </p>
        <p className="rounded-2xl bg-white p-3 ring-1 ring-[#d8b77e]/70">
          2. Thêm ảnh thật của món hoặc không gian quán.
        </p>
        <p className="rounded-2xl bg-white p-3 ring-1 ring-[#d8b77e]/70">
          3. Dùng “Ẩn tạm” khi muốn lưu nháp, bật “Công khai” khi muốn khách xem.
        </p>
      </div>
    </section>
  );
}


