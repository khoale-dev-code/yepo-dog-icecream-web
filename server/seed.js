import { connectDatabase } from "./config/db.js";
import { Product } from "./models/Product.js";
import { Shop } from "./models/Shop.js";

const sampleProducts = [
  {
    name: "Galeto Yuzu",
    slug: "galeto-yuzu",
    category: "Gelato",
    description: "Vị citrus thanh nhẹ, mát và hợp với những ngày Sài Gòn nóng.",
    price: 69000,
    oldPrice: 79000,
    isFeatured: true,
    sortOrder: 1,
    tags: ["yuzu", "gelato", "fresh"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=1000&q=80",
        resourceType: "image",
        alt: "Yuzu gelato",
      },
    ],
  },
  {
    name: "Puppy Vanilla Scoop",
    slug: "puppy-vanilla-scoop",
    category: "Ice Cream",
    description: "Kem vanilla mềm mịn, béo thơm, dễ ăn cho lần đầu ghé YEPO.",
    price: 59000,
    isFeatured: true,
    sortOrder: 2,
    tags: ["vanilla", "best seller"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=1000&q=80",
        resourceType: "image",
        alt: "Vanilla ice cream",
      },
    ],
  },
  {
    name: "Cocoa Paw Frappe",
    slug: "cocoa-paw-frappe",
    category: "Drink",
    description: "Đá xay cacao đậm vị, topping kem béo và sốt chocolate.",
    price: 75000,
    isFeatured: true,
    sortOrder: 3,
    tags: ["drink", "cocoa"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=1000&q=80",
        resourceType: "image",
        alt: "Cocoa frappe",
      },
    ],
  },
  {
    name: "Strawberry Tail Cone",
    slug: "strawberry-tail-cone",
    category: "Ice Cream",
    description: "Dâu tây chua ngọt, màu xinh và rất hợp chụp hình cùng idol cún.",
    price: 65000,
    sortOrder: 4,
    tags: ["strawberry", "cone"],
    media: [
      {
        url: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=1000&q=80",
        resourceType: "image",
        alt: "Strawberry cone",
      },
    ],
  },
];

async function seed() {
  await connectDatabase();

  await Shop.findOneAndUpdate(
    { slug: "yepo-dog-icecream" },
    { slug: "yepo-dog-icecream" },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);

  console.log("Seeded YEPO shop and products.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
