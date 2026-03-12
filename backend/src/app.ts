import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import variantsRouter from "./routes/variants.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/variants", variantsRouter);

// Note: No centralized error-handling middleware exists.
// Unhandled errors may produce inconsistent response formats.

export default app;
