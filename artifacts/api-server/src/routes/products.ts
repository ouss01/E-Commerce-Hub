import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, like, and, gte, lte, sql, desc, asc } from "drizzle-orm";
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

function formatProduct(p: any, category?: any) {
  return {
    id: p.id,
    name: p.name,
    nameFr: p.nameFr,
    nameAr: p.nameAr,
    slug: p.slug,
    description: p.description,
    descriptionFr: p.descriptionFr,
    descriptionAr: p.descriptionAr,
    price: parseFloat(p.price),
    stock: p.stock,
    images: p.images || [],
    categoryId: p.categoryId,
    category: category ? {
      id: category.id,
      name: category.name,
      nameFr: category.nameFr,
      nameAr: category.nameAr,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: 0,
    } : null,
    featured: p.featured,
    careLevel: p.careLevel,
    lightRequirement: p.lightRequirement,
    wateringFrequency: p.wateringFrequency,
    averageRating: null,
    reviewCount: 0,
    createdAt: p.createdAt,
  };
}

router.get("/featured", async (_req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.featured, true))
      .limit(8);
    res.json(products.map((r) => formatProduct(r.products, r.categories)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = req.query.sortBy as string;

    const conditions = [];
    if (category) {
      const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
    }
    if (search) {
      conditions.push(like(productsTable.name, `%${search}%`));
    }
    if (minPrice !== undefined) {
      conditions.push(gte(productsTable.price, minPrice.toString()));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(productsTable.price, maxPrice.toString()));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    if (sortBy === "price_asc") orderBy = asc(productsTable.price);
    else if (sortBy === "price_desc") orderBy = desc(productsTable.price);
    else orderBy = desc(productsTable.createdAt);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(where);

    const products = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    res.json({
      products: products.map((r) => formatProduct(r.products, r.categories)),
      total: Number(count),
      page,
      totalPages: Math.ceil(Number(count) / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, nameFr, nameAr, description, descriptionFr, descriptionAr, price, stock, images, categoryId, featured, careLevel, lightRequirement, wateringFrequency } = req.body;
    const slug = makeSlug(nameFr || name);
    const [product] = await db.insert(productsTable).values({
      name, nameFr, nameAr, slug, description, descriptionFr, descriptionAr,
      price: price.toString(), stock: stock || 0,
      images: images || [],
      categoryId: categoryId || null,
      featured: featured || false,
      careLevel, lightRequirement, wateringFrequency,
    }).returning();
    res.status(201).json(formatProduct(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.slug, req.params.slug))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(row.products, row.categories));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:slug", requireAdmin, async (req, res) => {
  try {
    const { name, nameFr, nameAr, description, descriptionFr, descriptionAr, price, stock, images, categoryId, featured, careLevel, lightRequirement, wateringFrequency } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (nameFr !== undefined) updates.nameFr = nameFr;
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (description !== undefined) updates.description = description;
    if (descriptionFr !== undefined) updates.descriptionFr = descriptionFr;
    if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr;
    if (price !== undefined) updates.price = price.toString();
    if (stock !== undefined) updates.stock = stock;
    if (images !== undefined) updates.images = images;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (featured !== undefined) updates.featured = featured;
    if (careLevel !== undefined) updates.careLevel = careLevel;
    if (lightRequirement !== undefined) updates.lightRequirement = lightRequirement;
    if (wateringFrequency !== undefined) updates.wateringFrequency = wateringFrequency;

    const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.slug, req.params.slug)).returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:slug", requireAdmin, async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.slug, req.params.slug));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
