import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/", async (_req, res) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        nameFr: categoriesTable.nameFr,
        nameAr: categoriesTable.nameAr,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        image: categoriesTable.image,
        productCount: sql<number>`count(${productsTable.id})`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.id);
    res.json(categories.map(c => ({ ...c, productCount: Number(c.productCount) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, nameFr, nameAr, description, image } = req.body;
    const slug = makeSlug(nameFr || name);
    const [cat] = await db.insert(categoriesTable).values({ name, nameFr, nameAr, slug, description, image }).returning();
    res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:slug", requireAdmin, async (req, res) => {
  try {
    const { name, nameFr, nameAr, description, image } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (nameFr !== undefined) { updates.nameFr = nameFr; if (!name) updates.name = nameFr; }
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;

    const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.slug, req.params.slug)).returning();
    if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ ...cat, productCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:slug", requireAdmin, async (req, res) => {
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.slug, req.params.slug));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        nameFr: categoriesTable.nameFr,
        nameAr: categoriesTable.nameAr,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        image: categoriesTable.image,
        productCount: sql<number>`count(${productsTable.id})`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(categoriesTable.slug, req.params.slug))
      .groupBy(categoriesTable.id)
      .limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ ...rows[0], productCount: Number(rows[0].productCount) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
