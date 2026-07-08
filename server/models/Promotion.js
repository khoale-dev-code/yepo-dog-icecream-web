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
    type: {
      type: String,
      default: "image",
      trim: true,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    code: {
      type: String,
      default: "",
      trim: true,
    },

    promoCode: {
      type: String,
      default: "",
      trim: true,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
    },

    discountText: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: String,
      default: "",
      trim: true,
    },

    endDate: {
      type: String,
      default: "",
      trim: true,
    },

    validFrom: {
      type: String,
      default: "",
      trim: true,
    },

    validTo: {
      type: String,
      default: "",
      trim: true,
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

    linkLabel: {
      type: String,
      default: "",
      trim: true,
    },

    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },

    sortOrder: {
      type: Number,
      default: 999,
    },

    order: {
      type: Number,
      default: 999,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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
  const firstImage = media.find((item) => {
    const type = item.resourceType || item.type || "image";
    return type !== "video";
  });

  return firstImage?.url || "";
}

promotionSchema.pre("save", function syncPromotionAliases(next) {
  const title = this.title || this.name || "Khuyến mãi YEPO";
  const description = this.description || this.content || this.caption || "";
  const code = this.code || this.promoCode || this.couponCode || "";
  const imageUrl =
    this.imageUrl ||
    this.image ||
    this.thumbnailUrl ||
    getFirstImageUrl(this.media);

  this.title = title;
  this.name = title;

  this.description = description;
  this.content = description;
  this.caption = description;

  this.code = code;
  this.promoCode = code;
  this.couponCode = code;

  this.validFrom = this.validFrom || this.startDate || "";
  this.validTo = this.validTo || this.endDate || "";
  this.startDate = this.startDate || this.validFrom || "";
  this.endDate = this.endDate || this.validTo || "";

  this.imageUrl = imageUrl || "";
  this.image = imageUrl || "";
  this.thumbnailUrl = imageUrl || "";

  this.sortOrder = Number(this.sortOrder || this.order || 999);
  this.order = Number(this.order || this.sortOrder || 999);

  if (this.imageUrl && (!this.media || this.media.length === 0)) {
    this.media = [
      {
        url: this.imageUrl,
        publicId: "",
        resourceType: "image",
        type: "image",
        originalName: "Ảnh khuyến mãi",
        name: "Ảnh khuyến mãi",
      },
    ];
  }

  next();
});

const Promotion =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

export { Promotion };
export default Promotion;
