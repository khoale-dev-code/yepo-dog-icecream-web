import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import { assertCloudinaryReady, cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 12,
  },
});

function getResourceType(file) {
  if (file.mimetype.startsWith("video/")) return "video";
  if (file.mimetype.startsWith("image/")) return "image";
  return "raw";
}

function uploadFile(file) {
  const resourceType = getResourceType(file);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder || "yepo-dog-icecream",
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format || "",
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          originalName: file.originalname,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

router.post("/", upload.array("files", 12), async (req, res, next) => {
  try {
    assertCloudinaryReady();

    if (!req.files?.length) {
      return res.status(400).json({ message: "Chưa có file để upload." });
    }

    const media = await Promise.all(req.files.map(uploadFile));

    return res.status(201).json({ media });
  } catch (error) {
    next(error);
  }
});

export default router;
