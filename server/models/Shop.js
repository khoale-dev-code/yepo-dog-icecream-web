import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    coverImageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    name: {
      type: String,
      default: "YEPO Dog & Ice Cream",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Dog & Ice Cream",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Không gian kem và đồ uống dành cho khách yêu cún, có menu online, khuyến mãi và chỉ đường nhanh.",
      trim: true,
    },
    note: {
      type: String,
      default: "Không mang thú cưng bên ngoài vào quán.",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "237 Bến Vân Đồn, TP.HCM",
      trim: true,
    },
    openingHours: {
      type: String,
      default: "10:00 - 21:00",
      trim: true,
    },
    dogInteractionHours: {
      type: String,
      default: "10:00 - 14:00 & 16:00 - 20:00",
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: "https://www.instagram.com/yepo.dog.icecream",
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      default: "",
      trim: true,
    },
    googleMapsEmbedUrl: {
      type: String,
      default: "",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    coverUrl: {
      type: String,
      default: "",
      trim: true,
    },
    heroImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    stats: {
      dogs: {
        type: Number,
        default: 0,
      },
      flavors: {
        type: Number,
        default: 0,
      },
      dailyHours: {
        type: Number,
        default: 11,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model("Shop", shopSchema);
