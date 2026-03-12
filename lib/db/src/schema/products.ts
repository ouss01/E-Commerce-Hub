import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionAr: text("description_ar").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  featured: boolean("featured").notNull().default(false),
  careLevel: text("care_level").default("facile"),
  lightRequirement: text("light_requirement").default("lumière indirecte"),
  wateringFrequency: text("watering_frequency").default("1 fois par semaine"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
