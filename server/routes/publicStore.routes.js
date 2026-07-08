import express from "express";
import { Dog } from "../models/Dog.js";
import { MenuCategory } from "../models/MenuCategory.js";
import { Post } from "../models/Post.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { Shop } from "../models/Shop.js";
import { Topping } from "../models/Topping.js";

const router = express.Router();

async function getOrCreateShop() {
  let shop = await Shop.findOne({}).lean();

  if (!shop) {
    const createdShop = await Shop.create({});
    shop = createdShop.toObject();
  }

  return shop;
}

router.get("/", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");

    const [shop, categories, products, toppings, posts, promotions, dogs] =
      await Promise.all([
        getOrCreateShop(),

        MenuCategory.find({ isActive: { $ne: false } })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),

        Product.find({ isAvailable: { $ne: false } })
          .populate("categoryId", "name isActive sortOrder")
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),

        Topping.find({ isAvailable: { $ne: false } })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),

        Post.find({ isPublished: { $ne: false } })
          .sort({ isPinned: -1, createdAt: -1 })
          .lean(),

        Promotion.find({ isActive: { $ne: false } })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),

        Dog.find({ isActive: { $ne: false } })
          .sort({ sortOrder: 1, isFeatured: -1, createdAt: -1 })
          .lean(),
      ]);

    res.json({
      shop,
      categories,
      products,
      toppings,
      posts,
      promotions,
      dogs,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
