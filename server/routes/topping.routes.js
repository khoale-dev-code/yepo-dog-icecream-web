import express from "express";
import Topping from "../models/Topping.js";

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

function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => {
      const url = getMediaUrl(item);

      if (!url) return null;

      if (typeof item === "string") {
        return {
          url,
          publicId: "",
          resourceType: "image",
          originalName: "URL image",
        };
      }

      return {
        url,
        publicId: item.publicId || item.public_id || "",
        resourceType: item.resourceType || item.resource_type || item.type || "image",
        originalName: item.originalName || item.original_name || item.name || "Topping image",
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

  next.name = String(next.name || "").trim();
  next.description = String(next.description || "").trim();
  next.price = Number(next.price || 0);
  next.sortOrder = Number(next.sortOrder || 999);

  const imageUrl = String(
    next.imageUrl ||
      next.image ||
      next.thumbnailUrl ||
      next.photoUrl ||
      next.coverUrl ||
      ""
  ).trim();

  next.media = normalizeMedia(next.media);

  if (imageUrl && next.media.length === 0) {
    next.media = [
      {
        url: imageUrl,
        publicId: "",
        resourceType: "image",
        originalName: "URL image",
      },
    ];
  }

  next.imageUrl =
    imageUrl ||
    next.media.find((item) => item.resourceType !== "video")?.url ||
    "";

  next.isAvailable = next.isAvailable !== false;
  next.isActive = next.isActive !== false;

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");

      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (status === "active") {
      filter.isActive = true;
      filter.isAvailable = true;
    }

    if (status === "hidden") {
      filter.$or = [{ isActive: false }, { isAvailable: false }];
    }

    const toppings = await Topping.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.json(toppings);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên topping.",
      });
    }

    const topping = await Topping.create(payload);

    res.status(201).json(topping);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên topping.",
      });
    }

    const topping = await Topping.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!topping) {
      return res.status(404).json({
        message: "Không tìm thấy topping.",
      });
    }

    res.json(topping);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const topping = await Topping.findByIdAndDelete(req.params.id);

    if (!topping) {
      return res.status(404).json({
        message: "Không tìm thấy topping.",
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
