import express from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

function createSlug(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const mediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().default(""),
  resourceType: z.enum(["image", "video", "raw"]).optional().default("image"),
  alt: z.string().optional().default(""),
});

const productSchema = z.object({
  name: z.string().min(2, "Tên món quá ngắn."),
  category: z.string().min(2, "Cần nhập danh mục."),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().min(0).optional().default(0),
  media: z.array(mediaSchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().optional().default(999),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, featured, q } = req.query;
    const filter = {};

    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (q) filter.$text = { $search: String(q) };

    const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ products });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json({ product });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = productSchema.parse(req.body);
    const slugBase = createSlug(parsed.name);
    const sameSlugCount = await Product.countDocuments({ slug: new RegExp(`^${slugBase}(-\\d+)?$`) });

    const product = await Product.create({
      ...parsed,
      slug: sameSlugCount ? `${slugBase}-${sameSlugCount + 1}` : slugBase,
      tags: parsed.tags.map((tag) => tag.trim()).filter(Boolean),
    });

    res.status(201).json({ product });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = productSchema.partial().parse(req.body);
    const update = { ...parsed };

    if (parsed.name) update.slug = createSlug(parsed.name);

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json({ product });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json({ message: "Đã xóa sản phẩm." });
  })
);

export default router;
