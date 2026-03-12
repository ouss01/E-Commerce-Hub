import { Router } from "express";
import { db, wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await db
      .select()
      .from(wishlistTable)
      .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(wishlistTable.userId, req.userId!));

    const result = items.filter(r => r.products).map(r => ({
      id: r.wishlist.id,
      userId: r.wishlist.userId,
      productId: r.wishlist.productId,
      createdAt: r.wishlist.createdAt,
      product: {
        id: r.products!.id,
        name: r.products!.name,
        nameFr: r.products!.nameFr,
        nameAr: r.products!.nameAr,
        slug: r.products!.slug,
        description: r.products!.description,
        descriptionFr: r.products!.descriptionFr,
        descriptionAr: r.products!.descriptionAr,
        price: parseFloat(r.products!.price),
        stock: r.products!.stock,
        images: r.products!.images || [],
        categoryId: r.products!.categoryId,
        category: r.categories ? { ...r.categories, productCount: 0 } : null,
        featured: r.products!.featured,
        careLevel: r.products!.careLevel,
        lightRequirement: r.products!.lightRequirement,
        wateringFrequency: r.products!.wateringFrequency,
        averageRating: null,
        reviewCount: 0,
        createdAt: r.products!.createdAt,
      },
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.body;
    const [item] = await db.insert(wishlistTable).values({ userId: req.userId!, productId }).returning();

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
    res.status(201).json({
      ...item,
      product: product ? {
        id: product.id,
        name: product.name,
        nameFr: product.nameFr,
        nameAr: product.nameAr,
        slug: product.slug,
        description: product.description,
        descriptionFr: product.descriptionFr,
        descriptionAr: product.descriptionAr,
        price: parseFloat(product.price),
        stock: product.stock,
        images: product.images || [],
        featured: product.featured,
        averageRating: null,
        reviewCount: 0,
        createdAt: product.createdAt,
      } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:productId", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(wishlistTable).where(
      and(eq(wishlistTable.userId, req.userId!), eq(wishlistTable.productId, parseInt(req.params.productId)))
    );
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
