import "dotenv/config";
import { PrismaClient, Role } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const products = [
  // ── Coffee ──
  { name: "Americano", description: "Strong black coffee, hot or iced", price: 49, stock: 100, category: "Coffee" },
  { name: "Cafe Latte", description: "Espresso with steamed milk", price: 49, stock: 100, category: "Coffee" },
  { name: "Vanilla Latte", description: "Latte with vanilla flavor", price: 49, stock: 100, category: "Coffee" },
  { name: "Spanish Latte", description: "Sweet creamy coffee", price: 49, stock: 100, category: "Coffee" },
  { name: "Matcha Coffee", description: "Coffee with matcha blend", price: 49, stock: 100, category: "Coffee" },
  { name: "Caramel Macchiato", description: "Coffee with caramel drizzle", price: 49, stock: 100, category: "Coffee" },
  { name: "White Choco Mocha", description: "Coffee with white chocolate", price: 49, stock: 100, category: "Coffee" },

  // ── Frappuccino ──
  { name: "Caramel Frappe", description: "Blended caramel coffee", price: 69, stock: 80, category: "Frappuccino" },
  { name: "Dark Mocha Frappe", description: "Rich chocolate coffee blend", price: 69, stock: 80, category: "Frappuccino" },
  { name: "White Mocha Frappe", description: "Creamy white chocolate coffee", price: 69, stock: 80, category: "Frappuccino" },
  { name: "Spanish Coffee Frappe", description: "Sweet Spanish-style coffee blend", price: 69, stock: 80, category: "Frappuccino" },
  { name: "Matcha Frappe", description: "Blended matcha drink", price: 69, stock: 80, category: "Frappuccino" },

  // ── Signature Latte ──
  { name: "Matcha Latte", description: "Creamy matcha drink", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Red Velvet Latte", description: "Sweet red velvet flavor", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Strawberry Latte", description: "Strawberry milk-based drink", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Artisan Chocolate", description: "Rich chocolate drink", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Mocha Latte", description: "Chocolate coffee mix", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Tableya Latte", description: "Filipino chocolate drink", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Ube Latte", description: "Purple yam flavored drink", price: 49, stock: 90, category: "Signature Latte" },
  { name: "Mango Latte", description: "Mango milk-based drink", price: 49, stock: 90, category: "Signature Latte" },

  // ── Frappe ──
  { name: "Creamy Ube Taro", description: "Ube and taro blended drink", price: 59, stock: 80, category: "Frappe" },
  { name: "Creamy Matcha", description: "Matcha blended drink", price: 59, stock: 80, category: "Frappe" },
  { name: "Creamy Strawberry", description: "Strawberry blended drink", price: 59, stock: 80, category: "Frappe" },
  { name: "Mocha Frappe", description: "Chocolate coffee blend", price: 59, stock: 80, category: "Frappe" },
  { name: "Artisan Chocolate Frappe", description: "Rich chocolate frappe", price: 59, stock: 80, category: "Frappe" },
  { name: "Creamy Mango", description: "Mango blended drink", price: 59, stock: 80, category: "Frappe" },
  { name: "Tableya Frappe", description: "Filipino chocolate frappe", price: 59, stock: 80, category: "Frappe" },

  // ── Milk Tea ──
  { name: "Wintermelon Milk Tea", description: "Sweet wintermelon flavor", price: 39, stock: 120, category: "Milk Tea" },
  { name: "Panda Pearl Milk Tea", description: "Milk tea with pearls", price: 39, stock: 120, category: "Milk Tea" },
  { name: "Hokkaido Milk Tea", description: "Creamy caramel milk tea", price: 39, stock: 120, category: "Milk Tea" },
  { name: "Okinawa Milk Tea", description: "Brown sugar milk tea", price: 39, stock: 120, category: "Milk Tea" },

  // ── Ice Cream ──
  { name: "Cone Swirl - Coffee Mocha", description: "Ice cream cone (coffee flavor)", price: 19, stock: 150, category: "Ice Cream" },
  { name: "Cone Swirl - Vanilla", description: "Classic vanilla cone", price: 19, stock: 150, category: "Ice Cream" },
  { name: "Cone Swirl - Milk Tea", description: "Milk tea flavored cone", price: 19, stock: 150, category: "Ice Cream" },
  { name: "Sundae Swirl - Coffee Mocha", description: "Ice cream cup (coffee flavor)", price: 39, stock: 120, category: "Ice Cream" },
  { name: "Sundae Swirl - Vanilla", description: "Vanilla sundae", price: 39, stock: 120, category: "Ice Cream" },
  { name: "Sundae Swirl - Milk Tea", description: "Milk tea sundae", price: 39, stock: 120, category: "Ice Cream" },

  // ── Dessert ──
  { name: "Ice Cream Croissant", description: "Croissant with soft serve ice cream", price: 49, stock: 60, category: "Dessert" },
  { name: "Croffle - Oreo", description: "Croissant waffle with Oreo", price: 99, stock: 50, category: "Dessert" },
  { name: "Croffle - Biscoff", description: "Croffle with Biscoff spread", price: 99, stock: 50, category: "Dessert" },
  { name: "Croffle - Choco Overload", description: "Chocolate-loaded croffle", price: 99, stock: 50, category: "Dessert" },
  { name: "Croffle - Strawberry", description: "Croffle with strawberries", price: 99, stock: 50, category: "Dessert" },

  // ── Add-ons ──
  { name: "Pearls", description: "Tapioca pearls", price: 15, stock: 200, category: "Add-ons" },
  { name: "Coffee Jelly", description: "Coffee-flavored jelly", price: 15, stock: 200, category: "Add-ons" },
  { name: "Ice Cream Float", description: "Ice cream topping", price: 19, stock: 150, category: "Add-ons" },
  { name: "Extra Coffee Shot", description: "Additional espresso shot", price: 15, stock: 200, category: "Add-ons" },
];

async function main() {
  console.log("Seeding database...");

  // Users
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const staffPassword = await bcrypt.hash("Staff123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@unclebrew.com" },
    update: {},
    create: { name: "Admin", email: "admin@unclebrew.com", password: adminPassword, role: Role.ADMIN },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@unclebrew.com" },
    update: {},
    create: { name: "Staff Member", email: "staff@unclebrew.com", password: staffPassword, role: Role.STAFF },
  });

  console.log("Users:", admin.email, staff.email);

  // Clear old products (inventory logs first due to FK)
  await prisma.inventoryLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  console.log("Cleared old products.");

  // Insert new products
  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    await prisma.inventoryLog.create({
      data: { productId: product.id, quantityChange: product.stock, reason: "Initial stock" },
    });
    console.log(`  + ${product.name}`);
  }

  console.log(`\nSeeded ${products.length} products across 7 categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
