/**
 * Task tests — these verify the features candidates are asked to implement.
 *
 * Most of these tests FAIL out-of-the-box (the endpoints return 501 or have
 * bugs). As you complete each task the corresponding tests should turn green.
 *
 * Run with: npm test
 */
import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import request from "supertest";
import app from "../src/app.js";
import db from "../src/db.js";

// Re-seed the database before the test suite so we have a known state.
beforeAll(() => {
  execSync("npx tsx src/seed.ts", { cwd: import.meta.dirname + "/.." });
});

// ─── Task 1: Create Product ────────────────────────────────────────────────

describe("Task 1 — Create Product", () => {
  it("POST /api/products creates a product with variants and returns 201", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Test Product",
        description: "A test product",
        category_id: 1,
        status: "active",
        variants: [
          { sku: "TEST-001", name: "Default", price_cents: 999, inventory_count: 10 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Product");
    expect(res.body.variants).toHaveLength(1);
    expect(res.body.variants[0].sku).toBe("TEST-001");
  });

  it("POST /api/products supports multiple variants", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Multi-Variant Product",
        category_id: 1,
        variants: [
          { sku: "MV-SM", name: "Small", price_cents: 500, inventory_count: 20 },
          { sku: "MV-LG", name: "Large", price_cents: 800, inventory_count: 15 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.variants).toHaveLength(2);
  });

  it("POST /api/products rejects missing product name", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        category_id: 1,
        variants: [
          { sku: "NO-NAME-1", name: "Default", price_cents: 100, inventory_count: 1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/products rejects empty variants array", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ name: "No Variants Product", category_id: 1, variants: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/products rejects a variant with missing SKU", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Bad Variant Product",
        category_id: 1,
        variants: [{ name: "Default", price_cents: 100, inventory_count: 1 }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/products rejects a duplicate SKU", async () => {
    // "ABP-4OZ" exists in seed data
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Duplicate SKU Product",
        category_id: 1,
        variants: [
          { sku: "ABP-4OZ", name: "Conflict", price_cents: 100, inventory_count: 1 },
        ],
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(res.body).toHaveProperty("error");
  });
});

// ─── Task 2: Update Variant ────────────────────────────────────────────────

describe("Task 2 — Update Variant", () => {
  it("PUT /api/variants/:id updates price and inventory", async () => {
    // Grab the first variant from the database
    const variant = db
      .prepare("SELECT * FROM variants LIMIT 1")
      .get() as { id: number; price_cents: number; inventory_count: number };

    const res = await request(app)
      .put(`/api/variants/${variant.id}`)
      .send({ price_cents: 4242, inventory_count: 77 });

    expect(res.status).toBe(200);
    expect(res.body.price_cents).toBe(4242);
    expect(res.body.inventory_count).toBe(77);
  });

  it("PUT /api/variants/:id returns 404 for non-existent variant", async () => {
    const res = await request(app)
      .put("/api/variants/99999")
      .send({ price_cents: 100 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("PUT /api/variants/:id rejects negative price_cents", async () => {
    const variant = db
      .prepare("SELECT id FROM variants LIMIT 1")
      .get() as { id: number };

    const res = await request(app)
      .put(`/api/variants/${variant.id}`)
      .send({ price_cents: -500 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("PUT /api/variants/:id rejects negative inventory_count", async () => {
    const variant = db
      .prepare("SELECT id FROM variants LIMIT 1")
      .get() as { id: number };

    const res = await request(app)
      .put(`/api/variants/${variant.id}`)
      .send({ inventory_count: -10 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// ─── Task 3: Soft-delete bug ───────────────────────────────────────────────

describe("Task 3 — Soft-delete bug", () => {
  it("GET /api/products excludes soft-deleted products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);

    const deletedProducts = res.body.filter(
      (p: { deleted_at: string | null }) => p.deleted_at !== null
    );
    expect(deletedProducts).toHaveLength(0);
  });

  it("GET /api/products returns fewer products than total in DB", async () => {
    const totalInDb = (
      db.prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number }
    ).c;
    const deletedInDb = (
      db
        .prepare(
          "SELECT COUNT(*) AS c FROM products WHERE deleted_at IS NOT NULL"
        )
        .get() as { c: number }
    ).c;

    const res = await request(app).get("/api/products");
    expect(res.body.length).toBe(totalInDb - deletedInDb);
  });
});

// ─── Task 5: Input validation ──────────────────────────────────────────────

describe("Task 5 — Input validation", () => {
  it("POST /api/products returns 400 JSON for missing name", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ variants: [{ sku: "VAL-1", name: "X", price_cents: 1, inventory_count: 1 }] });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/products returns 400 for variant with price_cents < 0", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Negative Price Product",
        category_id: 1,
        variants: [
          { sku: "NEG-PRICE-1", name: "Bad", price_cents: -100, inventory_count: 1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/products returns 400 for variant with inventory_count < 0", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Negative Inventory Product",
        category_id: 1,
        variants: [
          { sku: "NEG-INV-1", name: "Bad", price_cents: 100, inventory_count: -5 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("PUT /api/variants/:id returns JSON error for invalid data", async () => {
    const variant = db
      .prepare("SELECT id FROM variants LIMIT 1")
      .get() as { id: number };

    const res = await request(app)
      .put(`/api/variants/${variant.id}`)
      .send({ price_cents: -1 });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("error");
  });
});
