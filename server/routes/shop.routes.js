import express from "express";

function normalizeShopPayload(payload = {}) {
  const next = { ...payload };

  if (next.instagram && !next.instagramUrl) {
    next.instagramUrl = next.instagram;
  }

  if (next.instagramUrl && !next.instagram) {
    next.instagram = next.instagramUrl;
  }

  if (next.coverImageUrl && !next.coverUrl) {
    next.coverUrl = next.coverImageUrl;
  }

  if (next.coverUrl && !next.coverImageUrl) {
    next.coverImageUrl = next.coverUrl;
  }

  return next;
}

import { requireAdmin } from "../middleware/requireAdmin.js";
import { Shop } from "../models/Shop.js";

const router = express.Router();

async function getOrCreateShop() {
  let shop = await Shop.findOne({});

  if (!shop) {
    shop = await Shop.create({});
  }

  return shop;
}

router.get("/", async (req, res, next) => {
  try {
    const shop = await getOrCreateShop();

    res.json({ shop });
  } catch (error) {
    next(error);
  }
});

router.patch("/", requireAdmin, async (req, res, next) => {
  try {
    const currentShop = await getOrCreateShop();

    const shop = await Shop.findByIdAndUpdate(currentShop._id, normalizeShopPayload(req.body), {
      new: true,
      runValidators: true,
    });

    res.json({ shop });
  } catch (error) {
    next(error);
  }
});

export default router;
