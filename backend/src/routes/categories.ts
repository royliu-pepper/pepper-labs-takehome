import { Router } from "express";
import db from "../db.js";

const router = Router();

/**
 * GET /api/categories
 * List all categories with their active product count.
 */
router.get("/", (_req, res) => {
  try {
    const categories = db
      .prepare(
        `SELECT c.*, COUNT(p.id) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
         GROUP BY c.id
         ORDER BY c.name ASC`
      )
      .all();

    res.json(categories);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/categories/:id
 * Get a single category.
 */
router.get("/:id", (req, res) => {
  try {
    const category = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(Number(req.params.id));

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
