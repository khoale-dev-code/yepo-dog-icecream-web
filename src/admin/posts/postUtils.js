export const EMPTY_POST_FORM = {
  content: "",
  isPublished: true,
  isPinned: false,
  order: "",
};

export function getId(item) {
  return item?._id || item?.id || "";
}

export function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function inferTypeFromUrl(url = "") {
  const cleanUrl = String(url || "").toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogg")
  ) {
    return "video";
  }

  return "image";
}

export function inferTypeFromFile(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

export function isValidUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getMediaUrl(media) {
  if (!media) return "";
  if (typeof media === "string") return media;

  return (
    media.url ||
    media.secureUrl ||
    media.secure_url ||
    media.imageUrl ||
    media.src ||
    ""
  );
}

export function normalizePostMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          url: item,
          type: inferTypeFromUrl(item),
          resourceType: inferTypeFromUrl(item),
          name: `Media ${index + 1}`,
          originalName: `Media ${index + 1}`,
          publicId: "",
        };
      }

      const url = getMediaUrl(item);
      if (!url) return null;

      const type = item.type || item.resourceType || item.resource_type || inferTypeFromUrl(url);

      return {
        url,
        type,
        resourceType: type,
        name: item.name || item.originalName || `Media ${index + 1}`,
        originalName: item.originalName || item.name || `Media ${index + 1}`,
        publicId: item.publicId || item.public_id || "",
      };
    })
    .filter(Boolean);
}

export function makeDraftFromFile(file) {
  return {
    localId: createLocalId(),
    source: "file",
    file,
    url: URL.createObjectURL(file),
    type: inferTypeFromFile(file),
    name: file.name || "Media",
  };
}

export function makeDraftFromUrl(url) {
  return {
    localId: createLocalId(),
    source: "url",
    url,
    type: inferTypeFromUrl(url),
    name: "Media URL",
  };
}

export function makeDraftFromSavedMedia(media, index = 0) {
  return {
    localId: createLocalId(),
    source: "saved",
    url: media.url,
    type: media.type || media.resourceType || inferTypeFromUrl(media.url),
    name: media.name || media.originalName || `Media ${index + 1}`,
    publicId: media.publicId || "",
  };
}

export function revokeDraftUrls(drafts = []) {
  drafts.forEach((item) => {
    if (item.source === "file" && item.url) {
      URL.revokeObjectURL(item.url);
    }
  });
}

export function getPostContent(post) {
  return post?.content || post?.title || "";
}

export function getPostTitle(content = "") {
  const firstLine = String(content || "")
    .split("\n")
    .find((line) => line.trim());

  return firstLine ? firstLine.trim().slice(0, 120) : "Bài đăng YEPO";
}

export function formatPostDate(value) {
  if (!value) return "Vừa đăng";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Vừa đăng";

    return date.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Vừa đăng";
  }
}

function buildSavedMedia(drafts = []) {
  return drafts
    .filter((item) => item.source !== "file")
    .map((item, index) => ({
      url: item.url,
      type: item.type || inferTypeFromUrl(item.url),
      resourceType: item.type || inferTypeFromUrl(item.url),
      name: item.name || `Media ${index + 1}`,
      originalName: item.name || `Media ${index + 1}`,
      publicId: item.publicId || "",
    }));
}

async function uploadFiles(api, files = []) {
  if (files.length === 0) return [];

  if (api.uploadMedia) {
    const result = await api.uploadMedia(files);
    return normalizePostMedia(result.media || result.files || result.data || []);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Không upload được media.");
  }

  const result = await response.json();
  return normalizePostMedia(result.media || result.files || result.data || []);
}

export async function uploadDraftMedia(api, drafts = []) {
  const savedMedia = buildSavedMedia(drafts);
  const fileDrafts = drafts.filter((item) => item.source === "file" && item.file);
  const files = fileDrafts.map((item) => item.file);
  const uploadedMedia = await uploadFiles(api, files);

  return [...uploadedMedia, ...savedMedia];
}

export function buildPostPayload({ form, media, orderFallback = 999 }) {
  const cleanContent = String(form.content || "").trim();

  return {
    title: getPostTitle(cleanContent),
    content: cleanContent,
    excerpt: cleanContent.slice(0, 180),
    media: normalizePostMedia(media),
    isPublished: form.isPublished !== false,
    isActive: form.isPublished !== false,
    isPinned: form.isPinned === true,
    order: Number(form.order || orderFallback),
    sortOrder: Number(form.order || orderFallback),
  };
}

async function readApiError(response, fallbackMessage) {
  const error = await response.json().catch(() => ({}));
  return error.message || fallbackMessage;
}

export async function requestPosts(api) {
  if (api.posts?.list) {
    const result = await api.posts.list();
    const posts = Array.isArray(result) ? result : result.posts || result.data || [];
    return posts.map((post) => ({
      ...post,
      media: normalizePostMedia(post.media),
    }));
  }

  const response = await fetch("/api/posts", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tải được bài đăng."));
  }

  const posts = await response.json();

  return posts.map((post) => ({
    ...post,
    media: normalizePostMedia(post.media),
  }));
}

export async function createPost(api, payload) {
  if (api.posts?.create) return api.posts.create(payload);

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tạo được bài đăng."));
  }

  return response.json();
}

export async function updatePost(api, id, payload) {
  if (api.posts?.update) return api.posts.update(id, payload);

  const response = await fetch(`/api/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không cập nhật được bài đăng."));
  }

  return response.json();
}

export async function deletePost(api, id) {
  if (api.posts?.remove) return api.posts.remove(id);
  if (api.posts?.delete) return api.posts.delete(id);

  const response = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không xóa được bài đăng."));
  }

  return response.json();
}
