import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull().default('Geral'),
  items: text('items').notNull(),
  shareToken: text('share_token').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  checklistId: text('checklist_id').notNull(),
  answers: text('answers').notNull(),
  metadata: text('metadata').notNull().default('{}'),
  observations: text('observations').notNull().default(''),
  photos: text('photos').notNull().default('{}'),
  completedAt: integer('completed_at').notNull(),
});
