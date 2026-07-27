import { pgTable, serial, integer, text, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  description: text("description").notNull(),
  ingredients: text("ingredients").array().notNull().default([]),
  steps: text("steps").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  authorId: integer("author_id")
    .notNull()
    .references(() => usersTable.id),
  isForSale: boolean("is_for_sale").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
