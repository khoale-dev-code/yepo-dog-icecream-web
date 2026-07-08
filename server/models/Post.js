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

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    excerpt: {
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

    isPublished: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 999,
    },

    sortOrder: {
      type: Number,
      default: 999,
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

function getTitleFromContent(content = "") {
  const firstLine = String(content || "")
    .split("\n")
    .find((line) => line.trim());

  return firstLine ? firstLine.trim().slice(0, 120) : "Bài đăng YEPO";
}

postSchema.pre("save", function syncPostFields(next) {
  if (!this.title) {
    this.title = getTitleFromContent(this.content);
  }

  if (!this.excerpt) {
    this.excerpt = String(this.content || "").slice(0, 180);
  }

  this.isActive = this.isPublished !== false;

  if (!this.imageUrl && this.media?.length) {
    const firstImage = this.media.find((item) => {
      const type = item.type || item.resourceType || "image";
      return type !== "video";
    });

    this.imageUrl = firstImage?.url || "";
  }

  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export { Post };
export default Post;
