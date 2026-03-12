/**
 * Seed script — run with `npm run db:reset` from /backend (or root).
 * Drops all tables and re-creates them with realistic sample data.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "dev.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
db.exec(`
  DROP TABLE IF EXISTS variants;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS categories;

  CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    status      TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active','draft','archived')),
    deleted_at  TEXT    DEFAULT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE variants (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id),
    sku             TEXT    NOT NULL UNIQUE,
    name            TEXT    NOT NULL,
    price_cents     INTEGER NOT NULL DEFAULT 0 CHECK(price_cents >= 0),
    inventory_count INTEGER NOT NULL DEFAULT 0 CHECK(inventory_count >= 0),
    created_at      TEXT    DEFAULT (datetime('now')),
    updated_at      TEXT    DEFAULT (datetime('now'))
  );
`);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const insertCategory = db.prepare(
  "INSERT INTO categories (name, description) VALUES (?, ?)"
);

const insertProduct = db.prepare(
  `INSERT INTO products (name, description, category_id, status, deleted_at, created_at)
   VALUES (?, ?, ?, ?, ?, datetime('now', ?))`
);

const insertVariant = db.prepare(
  `INSERT INTO variants (product_id, sku, name, price_cents, inventory_count)
   VALUES (?, ?, ?, ?, ?)`
);

// --- Categories ---
const categories = [
  { name: "Proteins", description: "Beef, poultry, seafood, and plant-based proteins" },
  { name: "Produce", description: "Fresh fruits, vegetables, and herbs" },
  { name: "Dairy & Eggs", description: "Milk, cheese, butter, cream, and eggs" },
  { name: "Dry Goods & Pantry", description: "Grains, pasta, oils, sauces, and shelf-stable staples" },
  { name: "Beverages", description: "Coffee, tea, juices, and fountain supplies" },
  { name: "Kitchen Supplies", description: "Disposables, cleaning products, and smallwares" },
];

const catIds: Record<string, number> = {};
for (const c of categories) {
  const result = insertCategory.run(c.name, c.description);
  catIds[c.name] = Number(result.lastInsertRowid);
}

// Helper to create a product and its variants
function seedProduct(
  p: {
    name: string;
    description: string;
    category: string;
    status?: string;
    deleted?: boolean;
    daysAgo?: number;
  },
  variants: { sku: string; name: string; price_cents: number; inventory_count: number }[]
) {
  const result = insertProduct.run(
    p.name,
    p.description,
    catIds[p.category],
    p.status || "active",
    p.deleted ? new Date().toISOString() : null,
    `-${p.daysAgo ?? Math.floor(Math.random() * 60)} days`
  );
  const productId = Number(result.lastInsertRowid);
  for (const v of variants) {
    insertVariant.run(productId, v.sku, v.name, v.price_cents, v.inventory_count);
  }
}

// --- Proteins ---
seedProduct(
  { name: "Angus Beef Patties", description: "80/20 blend Angus beef patties, hand-formed. Flash-frozen for freshness.", category: "Proteins", daysAgo: 45 },
  [
    { sku: "ABP-4OZ", name: "4 oz (case of 40)", price_cents: 8999, inventory_count: 35 },
    { sku: "ABP-6OZ", name: "6 oz (case of 30)", price_cents: 10999, inventory_count: 28 },
    { sku: "ABP-8OZ", name: "8 oz (case of 20)", price_cents: 11999, inventory_count: 15 },
  ]
);

seedProduct(
  { name: "Boneless Skinless Chicken Breast", description: "All-natural boneless skinless chicken breast. No antibiotics ever.", category: "Proteins", daysAgo: 30 },
  [
    { sku: "BSCB-5LB", name: "5 lb bag", price_cents: 2199, inventory_count: 80 },
    { sku: "BSCB-10LB", name: "10 lb case", price_cents: 3999, inventory_count: 45 },
    { sku: "BSCB-40LB", name: "40 lb case", price_cents: 13999, inventory_count: 12 },
  ]
);

seedProduct(
  { name: "Atlantic Salmon Fillet", description: "Fresh Atlantic salmon fillets, skin-on, pin-bone removed. Farm-raised.", category: "Proteins", daysAgo: 12 },
  [
    { sku: "ASF-6OZ", name: "6 oz portion (case of 20)", price_cents: 15999, inventory_count: 10 },
    { sku: "ASF-8OZ", name: "8 oz portion (case of 16)", price_cents: 18999, inventory_count: 8 },
  ]
);

seedProduct(
  { name: "Plant-Based Burger Patty", description: "Soy and pea protein blend patty. Vegan, non-GMO.", category: "Proteins", status: "draft", daysAgo: 5 },
  [
    { sku: "PBP-4OZ", name: "4 oz (case of 40)", price_cents: 12999, inventory_count: 20 },
  ]
);

seedProduct(
  { name: "Applewood Smoked Bacon", description: "Thick-cut applewood smoked bacon. Cured with sea salt and brown sugar.", category: "Proteins", daysAgo: 38 },
  [
    { sku: "ASB-5LB", name: "5 lb slab", price_cents: 3499, inventory_count: 50 },
    { sku: "ASB-15LB", name: "15 lb case", price_cents: 9499, inventory_count: 18 },
  ]
);

seedProduct(
  { name: "Jumbo Shrimp 16/20", description: "Wild-caught Gulf shrimp, peeled and deveined. IQF frozen.", category: "Proteins", daysAgo: 20 },
  [
    { sku: "JS-2LB", name: "2 lb bag", price_cents: 2499, inventory_count: 40 },
    { sku: "JS-5LB", name: "5 lb case", price_cents: 5499, inventory_count: 22 },
  ]
);

// --- Produce ---
seedProduct(
  { name: "Romaine Lettuce Hearts", description: "Crisp romaine hearts, triple-washed and ready to use.", category: "Produce", daysAgo: 8 },
  [
    { sku: "RLH-3CT", name: "3-count pack", price_cents: 499, inventory_count: 120 },
    { sku: "RLH-CS24", name: "Case of 24", price_cents: 3299, inventory_count: 25 },
  ]
);

seedProduct(
  { name: "Vine-Ripened Tomatoes", description: "Greenhouse-grown vine-ripened tomatoes. Firm and flavorful.", category: "Produce", daysAgo: 6 },
  [
    { sku: "VRT-5LB", name: "5 lb box", price_cents: 899, inventory_count: 65 },
    { sku: "VRT-25LB", name: "25 lb case", price_cents: 3499, inventory_count: 15 },
  ]
);

seedProduct(
  { name: "Yellow Onions", description: "U.S. #1 grade yellow onions. Ideal for cooking and caramelizing.", category: "Produce", daysAgo: 14 },
  [
    { sku: "YO-3LB", name: "3 lb bag", price_cents: 349, inventory_count: 200 },
    { sku: "YO-50LB", name: "50 lb sack", price_cents: 3999, inventory_count: 30 },
  ]
);

seedProduct(
  { name: "Fresh Basil Bunch", description: "Fragrant Italian sweet basil. Locally sourced when in season.", category: "Produce", daysAgo: 3 },
  [
    { sku: "FBB-1BN", name: "Single bunch", price_cents: 299, inventory_count: 45 },
    { sku: "FBB-12BN", name: "Case of 12", price_cents: 2799, inventory_count: 8 },
  ]
);

seedProduct(
  { name: "Russet Potatoes", description: "Premium Idaho Russet potatoes. Great for baking, frying, or mashing.", category: "Produce", daysAgo: 18 },
  [
    { sku: "RP-10LB", name: "10 lb bag", price_cents: 799, inventory_count: 90 },
    { sku: "RP-50LB", name: "50 lb case", price_cents: 2999, inventory_count: 20 },
  ]
);

// SOFT-DELETED product — should NOT appear in active product list
seedProduct(
  { name: "Organic Baby Spinach", description: "Pre-washed organic baby spinach. Discontinued supplier.", category: "Produce", deleted: true, daysAgo: 60 },
  [
    { sku: "OBS-1LB", name: "1 lb clamshell", price_cents: 599, inventory_count: 3 },
    { sku: "OBS-2.5LB", name: "2.5 lb bag", price_cents: 1199, inventory_count: 0 },
  ]
);

// --- Dairy & Eggs ---
seedProduct(
  { name: "Heavy Whipping Cream", description: "Grade A heavy whipping cream, 36% milkfat. Ultra-pasteurized.", category: "Dairy & Eggs", daysAgo: 10 },
  [
    { sku: "HWC-QT", name: "Quart", price_cents: 599, inventory_count: 60 },
    { sku: "HWC-HG", name: "Half gallon", price_cents: 999, inventory_count: 35 },
  ]
);

seedProduct(
  { name: "Shredded Mozzarella Cheese", description: "Low-moisture part-skim mozzarella. Perfect melt for pizza and pasta.", category: "Dairy & Eggs", daysAgo: 22 },
  [
    { sku: "SMC-5LB", name: "5 lb bag", price_cents: 1999, inventory_count: 55 },
    { sku: "SMC-20LB", name: "20 lb case", price_cents: 6999, inventory_count: 12 },
  ]
);

seedProduct(
  { name: "Large Grade AA Eggs", description: "Farm-fresh large Grade AA eggs. Cage-free.", category: "Dairy & Eggs", daysAgo: 15 },
  [
    { sku: "EGG-15DZ", name: "15 dozen case", price_cents: 4499, inventory_count: 40 },
    { sku: "EGG-30DZ", name: "30 dozen case", price_cents: 7999, inventory_count: 0 },
  ]
);

seedProduct(
  { name: "Unsalted Butter", description: "European-style unsalted butter, 83% butterfat. Ideal for baking and sauces.", category: "Dairy & Eggs", daysAgo: 28 },
  [
    { sku: "UB-1LB", name: "1 lb block", price_cents: 599, inventory_count: 100 },
    { sku: "UB-36LB", name: "36 lb case", price_cents: 16999, inventory_count: 5 },
  ]
);

seedProduct(
  { name: "Crumbled Feta Cheese", description: "Traditional Mediterranean-style feta, pre-crumbled for salads and toppings.", category: "Dairy & Eggs", status: "draft", daysAgo: 4 },
  [
    { sku: "CFC-2LB", name: "2 lb tub", price_cents: 1299, inventory_count: 18 },
  ]
);

// --- Dry Goods & Pantry ---
seedProduct(
  { name: "Extra Virgin Olive Oil", description: "First cold-pressed extra virgin olive oil. Imported from Italy.", category: "Dry Goods & Pantry", daysAgo: 50 },
  [
    { sku: "EVOO-1L", name: "1 Liter bottle", price_cents: 1499, inventory_count: 70 },
    { sku: "EVOO-3L", name: "3 Liter tin", price_cents: 3499, inventory_count: 30 },
    { sku: "EVOO-5GAL", name: "5 gallon jug", price_cents: 11999, inventory_count: 8 },
  ]
);

seedProduct(
  { name: "San Marzano Crushed Tomatoes", description: "DOP-certified San Marzano tomatoes, hand-crushed with basil.", category: "Dry Goods & Pantry", daysAgo: 35 },
  [
    { sku: "SMCT-28OZ", name: "28 oz can", price_cents: 499, inventory_count: 150 },
    { sku: "SMCT-CS6", name: "Case of 6", price_cents: 2499, inventory_count: 40 },
  ]
);

seedProduct(
  { name: "All-Purpose Flour", description: "Unbleached enriched all-purpose flour. Consistent protein content for versatile use.", category: "Dry Goods & Pantry", daysAgo: 42 },
  [
    { sku: "APF-5LB", name: "5 lb bag", price_cents: 499, inventory_count: 110 },
    { sku: "APF-25LB", name: "25 lb bag", price_cents: 1699, inventory_count: 45 },
    { sku: "APF-50LB", name: "50 lb bag", price_cents: 2999, inventory_count: 20 },
  ]
);

seedProduct(
  { name: "Jasmine Rice", description: "Premium Thai jasmine rice. Aromatic long-grain, naturally gluten-free.", category: "Dry Goods & Pantry", daysAgo: 25 },
  [
    { sku: "JR-5LB", name: "5 lb bag", price_cents: 799, inventory_count: 85 },
    { sku: "JR-25LB", name: "25 lb bag", price_cents: 2999, inventory_count: 30 },
    { sku: "JR-50LB", name: "50 lb bag", price_cents: 4999, inventory_count: 10 },
  ]
);

// SOFT-DELETED product
seedProduct(
  { name: "Sriracha Hot Sauce (Original)", description: "Classic rooster brand sriracha. Recalled lot — discontinued.", category: "Dry Goods & Pantry", deleted: true, daysAgo: 55 },
  [
    { sku: "SHS-17OZ", name: "17 oz bottle", price_cents: 499, inventory_count: 2 },
    { sku: "SHS-28OZ", name: "28 oz bottle", price_cents: 799, inventory_count: 0 },
  ]
);

// --- Beverages ---
seedProduct(
  { name: "Cold Brew Coffee Concentrate", description: "Slow-steeped 12-hour cold brew concentrate. Dilute 1:1 with water or milk.", category: "Beverages", daysAgo: 16 },
  [
    { sku: "CBC-32OZ", name: "32 oz bottle", price_cents: 1299, inventory_count: 45 },
    { sku: "CBC-1GAL", name: "1 gallon jug", price_cents: 3499, inventory_count: 15 },
  ]
);

seedProduct(
  { name: "Orange Juice (Not from Concentrate)", description: "Fresh-squeezed style premium orange juice. No added sugar.", category: "Beverages", daysAgo: 9 },
  [
    { sku: "OJ-HG", name: "Half gallon", price_cents: 699, inventory_count: 55 },
    { sku: "OJ-GAL", name: "1 gallon", price_cents: 1099, inventory_count: 30 },
  ]
);

seedProduct(
  { name: "Chai Tea Latte Mix", description: "Spiced black tea latte powder mix. Just add steamed milk.", category: "Beverages", status: "draft", daysAgo: 2 },
  [
    { sku: "CTL-2LB", name: "2 lb canister", price_cents: 1999, inventory_count: 25 },
  ]
);

seedProduct(
  { name: "Lemonade Syrup", description: "Real lemon juice base syrup for fountain or hand-mixed lemonade.", category: "Beverages", daysAgo: 32 },
  [
    { sku: "LS-64OZ", name: "64 oz bottle", price_cents: 1299, inventory_count: 40 },
    { sku: "LS-1GAL", name: "1 gallon jug", price_cents: 1999, inventory_count: 20 },
  ]
);

// --- Kitchen Supplies ---
seedProduct(
  { name: "Nitrile Disposable Gloves", description: "Powder-free nitrile gloves. FDA food-contact approved.", category: "Kitchen Supplies", daysAgo: 40 },
  [
    { sku: "NDG-S", name: "Small (box of 100)", price_cents: 1299, inventory_count: 60 },
    { sku: "NDG-M", name: "Medium (box of 100)", price_cents: 1299, inventory_count: 90 },
    { sku: "NDG-L", name: "Large (box of 100)", price_cents: 1299, inventory_count: 75 },
    { sku: "NDG-XL", name: "X-Large (box of 100)", price_cents: 1299, inventory_count: 40 },
  ]
);

seedProduct(
  { name: "Kraft Paper Takeout Containers", description: "Eco-friendly kraft paper containers with fold-over lid. Microwave safe.", category: "Kitchen Supplies", daysAgo: 26 },
  [
    { sku: "KTC-26OZ", name: "26 oz (case of 200)", price_cents: 4999, inventory_count: 30 },
    { sku: "KTC-46OZ", name: "46 oz (case of 150)", price_cents: 5999, inventory_count: 18 },
  ]
);

seedProduct(
  { name: "Stainless Steel Mixing Bowls", description: "Heavy-duty stainless steel mixing bowls. Flat base, rolled rim.", category: "Kitchen Supplies", daysAgo: 48 },
  [
    { sku: "SSMB-3QT", name: "3 Quart", price_cents: 1299, inventory_count: 0 },
    { sku: "SSMB-5QT", name: "5 Quart", price_cents: 1699, inventory_count: 4 },
    { sku: "SSMB-8QT", name: "8 Quart", price_cents: 2199, inventory_count: 12 },
  ]
);

seedProduct(
  { name: "Commercial Degreaser Spray", description: "Heavy-duty kitchen degreaser. Cuts through grease on contact.", category: "Kitchen Supplies", daysAgo: 34 },
  [
    { sku: "CDS-32OZ", name: "32 oz spray bottle", price_cents: 799, inventory_count: 85 },
    { sku: "CDS-1GAL", name: "1 gallon refill", price_cents: 1999, inventory_count: 25 },
  ]
);

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
const productCount = (db.prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number }).c;
const variantCount = (db.prepare("SELECT COUNT(*) AS c FROM variants").get() as { c: number }).c;
const deletedCount = (db.prepare("SELECT COUNT(*) AS c FROM products WHERE deleted_at IS NOT NULL").get() as { c: number }).c;

console.log(`Database seeded successfully!`);
console.log(`  ${categories.length} categories`);
console.log(`  ${productCount} products (${deletedCount} soft-deleted)`);
console.log(`  ${variantCount} variants`);
console.log(`  Database: ${dbPath}`);
