import express from "express";
import { MenuCategory } from "../models/MenuCategory.js";
import { Product } from "../models/Product.js";

const router = express.Router();


router.patch("/reorder", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({
        message: "Danh sách id danh mục không hợp lệ.",
      });
    }

    await MenuCategory.bulkWrite(
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

    const categories = await MenuCategory
      .find({})
      .sort({ sortOrder: 1, order: 1, createdAt: 1 });

    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.active === "true") {
      filter.isActive = { $ne: false };
    }

    const categories = await MenuCategory.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const category = await MenuCategory.create({
      name: req.body.name,
      description: req.body.description || "",
      sortOrder: req.body.sortOrder ?? 999,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Danh mục này đã tồn tại.";
    }

    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
    };

    if (payload.name) {
      payload.slug = payload.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    if (payload.name) {
      await Product.updateMany(
        { categoryId: category._id },
        { category: category.name }
      );
    }

    return res.json({ category });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({
      categoryId: req.params.id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Danh mục đang có ${productCount} món. Hãy chuyển món sang danh mục khác trước khi xóa.`,
      });
    }

    const category = await MenuCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
