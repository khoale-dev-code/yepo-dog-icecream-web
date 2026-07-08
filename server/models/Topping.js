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
      default: "image",
      trim: true,
    },
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

const toppingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    group: {
      type: String,
      default: "Topping",
      trim: true,
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

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },

    media: {
      type: [mediaSchema],
      default: [],
    },

    sortOrder: {
      type: Number,
      default: 999,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

function getFirstImageUrl(media = []) {
  const firstImage = media.find((item) => item.resourceType !== "video");
  return firstImage?.url || "";
}

toppingSchema.pre("save", function syncToppingImageAliases(next) {
  const fallbackImageUrl =
    this.imageUrl ||
    this.image ||
    this.thumbnailUrl ||
    getFirstImageUrl(this.media);

  this.imageUrl = fallbackImageUrl || "";
  this.image = fallbackImageUrl || "";
  this.thumbnailUrl = fallbackImageUrl || "";

  if (this.imageUrl && (!this.media || this.media.length === 0)) {
    this.media = [
      {
        url: this.imageUrl,
        publicId: "",
        resourceType: "image",
        originalName: "Topping image",
      },
    ];
  }

  next();
});

const Topping =
  mongoose.models.Topping || mongoose.model("Topping", toppingSchema);

export { Topping };
export default Topping;
