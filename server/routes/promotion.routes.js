import express from "express";
import Promotion from "../models/Promotion.js";

const router = express.Router();

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

function inferMediaType(url = "", fallback = "image") {
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

  return fallback || "image";
}

function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      const url = getMediaUrl(item);

      if (!url) return null;

      const type =
        typeof item === "string"
          ? inferMediaType(url)
          : item.resourceType || item.type || item.resource_type || inferMediaType(url);

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

function cleanPayload(payload = {}) {
  const next = { ...payload };

  delete next._id;
  delete next.id;
  delete next.__v;
  delete next.createdAt;
  delete next.updatedAt;

  next.title = String(next.title || next.name || "").trim();
  next.name = next.title;

  next.description = String(
    next.description ||
      next.content ||
      next.caption ||
      ""
  ).trim();

  next.content = next.description;
  next.caption = next.description;

  next.code = String(
    next.code ||
      next.promoCode ||
      next.couponCode ||
      ""
  ).trim();

  next.promoCode = next.code;
  next.couponCode = next.code;

  next.discountText = String(next.discountText || "").trim();

  next.startDate = next.startDate || next.validFrom || "";
  next.endDate = next.endDate || next.validTo || "";
  next.validFrom = next.startDate;
  next.validTo = next.endDate;

  next.linkLabel = String(next.linkLabel || "").trim();
  next.linkUrl = String(next.linkUrl || "").trim();

  next.media = normalizeMedia(next.media);

  const imageUrl = String(
    next.imageUrl ||
      next.image ||
      next.thumbnailUrl ||
      ""
  ).trim();

  next.imageUrl =
    imageUrl ||
    next.media.find((item) => item.resourceType !== "video" && item.type !== "video")?.url ||
    "";

  if (next.imageUrl && next.media.length === 0) {
    next.media = [
      {
        url: next.imageUrl,
        publicId: "",
        resourceType: "image",
        type: "image",
        originalName: "Ảnh khuyến mãi",
        name: "Ảnh khuyến mãi",
      },
    ];
  }

  next.sortOrder = Number(next.sortOrder || 999);
  next.order = Number(next.order || next.sortOrder || 999);
  next.isFeatured = next.isFeatured === true;
  next.isActive = next.isActive !== false;

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
        { name: regex },
        { description: regex },
        { content: regex },
        { code: regex },
        { promoCode: regex },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "hidden") {
      filter.isActive = false;
    }

    if (status === "featured") {
      filter.isFeatured = true;
    }

    const promotions = await Promotion.find(filter).sort({
      sortOrder: 1,
      order: 1,
      createdAt: -1,
    });

    res.json(promotions);
  } catch (error) {
    next(error);
  }
});

router.patch("/reorder", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res.status(400).json({
        message: "Vui lòng gửi danh sách ID khuyến mãi cần sắp xếp.",
      });
    }

    await Promotion.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              sortOrder: index + 1,
              order: index + 1,
            },
          },
        },
      }))
    );

    const promotions = await Promotion.find({ _id: { $in: ids } }).sort({
      sortOrder: 1,
      order: 1,
      createdAt: -1,
    });

    res.json({
      ok: true,
      promotions,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề khuyến mãi.",
      });
    }

    const promotion = await Promotion.create(payload);

    res.status(201).json(promotion);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề khuyến mãi.",
      });
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return res.status(404).json({
        message: "Không tìm thấy khuyến mãi.",
      });
    }

    res.json(promotion);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        message: "Không tìm thấy khuyến mãi.",
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
