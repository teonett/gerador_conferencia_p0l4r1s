import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull().default('Geral'),
  items: text('items').notNull(),
  headerId: text('header_id'),
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
  itemObservations: text('item_observations').notNull().default('{}'),
  photos: text('photos').notNull().default('{}'),
  signatureName: text('signature_name').notNull().default(''),
  extraItems: text('extra_items').notNull().default('[]'),
  completedAt: integer('completed_at').notNull(),
  updatedAt: integer('updated_at'),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const headers = sqliteTable('headers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  fields: text('fields').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
