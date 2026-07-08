import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    format: {
      type: String,
      default: "",
      trim: true,
    },
    width: Number,
    height: Number,
    bytes: Number,
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      default: null,
      index: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    sizes: {
      type: [sizeSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 999,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function syncImageUrl(next) {
  if (!this.imageUrl && this.media?.length) {
    this.imageUrl = this.media[0].url;
  }

  next();
});

export const Product = mongoose.model("Product", productSchema);
