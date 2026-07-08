import express from "express";
import { Dog } from "../models/Dog.js";

const router = express.Router();

function buildFilter(query) {
  const filter = {};

  if (query.active === "true") {
    filter.isActive = { $ne: false };
  }

  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.gender) {
    filter.gender = query.gender;
  }

  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: "i" } },
      { nickname: { $regex: query.q, $options: "i" } },
      { breed: { $regex: query.q, $options: "i" } },
      { coatColor: { $regex: query.q, $options: "i" } },
      { personality: { $regex: query.q, $options: "i" } },
    ];
  }

  return filter;
}

router.get("/", async (req, res, next) => {
  try {
    const dogs = await Dog.find(buildFilter(req.query))
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ dogs });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const dog = await Dog.create(req.body);

    res.status(201).json({ dog });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const dog = await Dog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dog) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ cún." });
    }

    return res.json({ dog });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const dog = await Dog.findByIdAndDelete(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ cún." });
    }

    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
