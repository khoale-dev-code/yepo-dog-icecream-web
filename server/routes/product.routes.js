import express from "express";
import mongoose from "mongoose";
import { MenuCategory } from "../models/MenuCategory.js";
import { Product } from "../models/Product.js";

const router = express.Router();

function buildFilter(query) {
  const filter = {};

  if (query.available === "true" || query.status === "available") {
    filter.isAvailable = { $ne: false };
  }

  if (query.status === "unavailable") {
    filter.isAvailable = false;
  }

  if (query.status === "featured" || query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.categoryId && mongoose.Types.ObjectId.isValid(query.categoryId)) {
    filter.categoryId = query.categoryId;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: "i" } },
      { description: { $regex: query.q, $options: "i" } },
      { category: { $regex: query.q, $options: "i" } },
      { tags: { $regex: query.q, $options: "i" } },
    ];
  }

  return filter;
}

function toNumber(value, fallback = 0) {
  const number = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(number) ? number : fallback;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];

  return sizes
    .map((size) => ({
      name: String(size.name || "").trim(),
      price: toNumber(size.price),
      oldPrice: toNumber(size.oldPrice),
      isDefault: Boolean(size.isDefault),
    }))
    .filter((size) => size.name);
}

async function normalizePayload(payload, { partial = false } = {}) {
  const next = {};

  if (!partial || "name" in payload) {
    next.name = String(payload.name || "").trim();
  }

  if (!partial || "description" in payload) {
    next.description = String(payload.description || "").trim();
  }

  if (!partial || "price" in payload) {
    next.price = toNumber(payload.price);
  }

  if (!partial || "oldPrice" in payload) {
    next.oldPrice = toNumber(payload.oldPrice);
  }

  if (!partial || "sizes" in payload) {
    next.sizes = normalizeSizes(payload.sizes);
  }

  if (!partial || "tags" in payload) {
    next.tags = normalizeTags(payload.tags);
  }

  if (!partial || "sortOrder" in payload) {
    next.sortOrder = toNumber(payload.sortOrder, 999);
  }

  if (!partial || "isFeatured" in payload) {
    next.isFeatured = Boolean(payload.isFeatured);
  }

  if (!partial || "isAvailable" in payload) {
    next.isAvailable = payload.isAvailable !== false;
  }

  if (!partial || "media" in payload) {
    next.media = Array.isArray(payload.media) ? payload.media : [];
  }

  if ("imageUrl" in payload) {
    next.imageUrl = String(payload.imageUrl || "").trim();
  }

  if (!partial || "categoryId" in payload) {
    if (payload.categoryId && mongoose.Types.ObjectId.isValid(payload.categoryId)) {
      const category = await MenuCategory.findById(payload.categoryId).lean();
      next.categoryId = payload.categoryId;
      next.category = category?.name || "";
    } else {
      next.categoryId = null;
      next.category = String(payload.category || "").trim();
    }
  }

  if (!next.imageUrl && Array.isArray(next.media) && next.media.length > 0) {
    next.imageUrl = next.media[0].url;
  }

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find(buildFilter(req.query))
      .populate("categoryId", "name isActive sortOrder")
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = await normalizePayload(req.body);
    const product = await Product.create(payload);

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.patch("/reorder", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    await Promise.all(
      ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id, index) =>
          Product.findByIdAndUpdate(id, {
            sortOrder: index + 1,
          })
        )
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = await normalizePayload(req.body, { partial: true });

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    return res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
