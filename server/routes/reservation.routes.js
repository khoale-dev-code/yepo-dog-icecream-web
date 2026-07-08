import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Reservation } from "../models/Reservation.js";

const router = express.Router();

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const reservations = await Reservation.find(filter)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .lean();

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const reservation = await Reservation.create({
      customerName: req.body.customerName,
      phone: req.body.phone,
      date: req.body.date,
      time: req.body.time,
      guestCount: req.body.guestCount || 2,
      note: req.body.note || "",
      status: "pending",
    });

    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Không tìm thấy lịch đặt bàn." });
    }

    return res.json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Không tìm thấy lịch đặt bàn." });
    }

    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
