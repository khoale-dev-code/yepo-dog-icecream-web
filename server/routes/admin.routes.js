import express from "express";
import { Dog } from "../models/Dog.js";
import { Post } from "../models/Post.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import { Reservation } from "../models/Reservation.js";
import { Topping } from "../models/Topping.js";

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const [
      products,
      availableProducts,
      toppings,
      dogs,
      posts,
      promotions,
      reservations,
      pendingReservations,
      latestReservations,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: { $ne: false } }),
      Topping.countDocuments(),
      Dog.countDocuments(),
      Post.countDocuments(),
      Promotion.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: "pending" }),
      Reservation.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    res.json({
      summary: {
        products,
        availableProducts,
        toppings,
        dogs,
        posts,
        promotions,
        reservations,
        pendingReservations,
      },
      latestReservations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
