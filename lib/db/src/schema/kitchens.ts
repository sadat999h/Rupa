import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kitchensTable = pgTable("kitchens", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .unique()
    .references(() => usersTable.id),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  description: text("description").notNull(),
  cuisineType: text("cuisine_type"),
  coverImage: text("cover_image"),
  location: text("location"),
  phone: text("phone"),
  isOpen: boolean("is_open").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKitchenSchema = createInsertSchema(kitchensTable).omit({
  id: true,
  ownerId: true,
  createdAt: true,
});
export type InsertKitchen = z.infer<typeof insertKitchenSchema>;
export type Kitchen = typeof kitchensTable.$inferSelect;
