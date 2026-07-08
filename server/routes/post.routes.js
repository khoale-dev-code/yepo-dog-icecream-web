import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

function inferTypeFromUrl(url = "") {
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

function getMediaUrl(media) {
  if (!media) return "";

  if (typeof media === "string") {
    return media.trim();
  }

  return String(
    media.url ||
      media.secureUrl ||
      media.secure_url ||
      media.imageUrl ||
      media.src ||
      ""
  ).trim();
}

function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      const url = getMediaUrl(item);

      if (!url) return null;

      const type =
        typeof item === "string"
          ? inferTypeFromUrl(url)
          : item.type || item.resourceType || item.resource_type || inferTypeFromUrl(url);

      return {
        url,
        publicId: typeof item === "string" ? "" : item.publicId || item.public_id || "",
        resourceType: type,
        type,
        originalName:
          typeof item === "string"
            ? `Media ${index + 1}`
            : item.originalName || item.original_name || item.name || `Media ${index + 1}`,
        name:
          typeof item === "string"
            ? `Media ${index + 1}`
            : item.name || item.originalName || `Media ${index + 1}`,
      };
    })
    .filter(Boolean);
}

function getTitleFromContent(content = "") {
  const firstLine = String(content || "")
    .split("\n")
    .find((line) => line.trim());

  return firstLine ? firstLine.trim().slice(0, 120) : "Bài đăng YEPO";
}

function cleanPayload(payload = {}) {
  const next = { ...payload };

  delete next._id;
  delete next.id;
  delete next.__v;
  delete next.createdAt;
  delete next.updatedAt;

  next.content = String(next.content || "").trim();
  next.title = String(next.title || "").trim() || getTitleFromContent(next.content);
  next.excerpt = String(next.excerpt || next.content || "").trim().slice(0, 180);
  next.media = normalizeMedia(next.media);

  next.imageUrl =
    String(next.imageUrl || "").trim() ||
    next.media.find((item) => item.type !== "video")?.url ||
    "";

  next.isPublished = next.isPublished !== false;
  next.isActive = next.isPublished;
  next.isPinned = next.isPinned === true;
  next.order = Number(next.order || next.sortOrder || 999);
  next.sortOrder = Number(next.sortOrder || next.order || 999);
  next.likeCount = Number(next.likeCount || 0);
  next.commentCount = Number(next.commentCount || 0);

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");

      filter.$or = [
        { title: regex },
        { content: regex },
        { excerpt: regex },
      ];
    }

    if (status === "published") {
      filter.isPublished = true;
      filter.isActive = true;
    }

    if (status === "hidden") {
      filter.$or = [
        { isPublished: false },
        { isActive: false },
      ];
    }

    if (status === "pinned") {
      filter.isPinned = true;
    }

    const posts = await Post.find(filter).sort({
      isPinned: -1,
      order: 1,
      sortOrder: 1,
      createdAt: -1,
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.content && payload.media.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung hoặc thêm media cho bài đăng.",
      });
    }

    const post = await Post.create(payload);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.content && payload.media.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung hoặc thêm media cho bài đăng.",
      });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài đăng.",
      });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài đăng.",
      });
    }

    res.json({
      ok: true,
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
