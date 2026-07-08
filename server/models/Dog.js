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

const coatColorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    hex: {
      type: String,
      default: "#b98c49",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const dogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      default: "",
      trim: true,
    },
    age: {
      type: String,
      default: "",
      trim: true,
    },
    breed: {
      type: String,
      default: "",
      trim: true,
    },

    colorTheme: { type: String, default: "pink" },
  frameColor: { type: String, default: "" },

    coatColor: {
      type: String,
      default: "",
      trim: true,
    },
    coatColors: {
      type: [coatColorSchema],
      default: [],
    },
    coatPattern: {
      type: String,
      enum: ["solid", "two-tone", "spotted", "dotted", "brindle", "mixed", "other"],
      default: "solid",
      index: true,
    },
    coatPatternDescription: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
      index: true,
    },
    birthday: {
      type: String,
      default: "",
      trim: true,
    },
    weightKg: {
      type: Number,
      default: 0,
      min: 0,
    },

    personality: {
      type: String,
      default: "",
      trim: true,
    },
    personalityTags: {
      type: [String],
      default: [],
    },

    favoriteTreat: {
      type: String,
      default: "",
      trim: true,
    },
    favoriteTreats: {
      type: [String],
      default: [],
    },

    cutenessLevel: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },
    interactionNote: {
      type: String,
      default: "",
      trim: true,
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

dogSchema.pre("save", function syncImageUrl(next) {
  if (!this.imageUrl && this.media?.length) {
    const firstImage = this.media.find((item) => item.resourceType !== "video");
    this.imageUrl = firstImage?.url || "";
  }

  if (!this.favoriteTreat && this.favoriteTreats?.length) {
    this.favoriteTreat = this.favoriteTreats.join(", ");
  }

  if (!this.personality && this.personalityTags?.length) {
    this.personality = this.personalityTags.join(", ");
  }

  if (!this.coatColor && this.coatColors?.length) {
    this.coatColor = this.coatColors.map((item) => item.name).filter(Boolean).join(", ");
  }

  next();
});

export const Dog = mongoose.model("Dog", dogSchema);
