import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const orders = sqliteTable('orders', {
 id: text('id').primaryKey(), userId: text('user_id'), idempotencyKey: text('idempotency_key').notNull().unique(),
 name: text('name').notNull(), phone: text('phone').notNull(), email: text('email').notNull(),
 queryType: text('query_type').notNull(), queryMasked: text('query_masked').notNull(),
 customerId:text('customer_id'),productId:text('product_id'),amountCents:integer('amount_cents').notNull().default(0),internalNotes:text('internal_notes').notNull().default(''),checkoutSnapshot:text('checkout_snapshot'), status: text('status').notNull().default('awaiting_contact'), consentAt: text('consent_at').notNull(),
 createdAt: text('created_at').notNull(), demo: integer('demo').notNull().default(1)
});
export const profiles = sqliteTable('profiles', {userId:text('user_id').primaryKey(),name:text('name').notNull(),phone:text('phone').notNull().default(''),contactEmail:text('contact_email').notNull(),updatedAt:text('updated_at').notNull()});
export const leads = sqliteTable('leads',{id:text('id').primaryKey(),eventKey:text('event_key').notNull().unique(),userId:text('user_id'),name:text('name').notNull().default(''),email:text('email').notNull().default(''),phone:text('phone').notNull().default(''),source:text('source').notNull(),queryType:text('query_type').notNull().default('CPF'),queryMasked:text('query_masked').notNull().default('Identificador oculto'),createdAt:text('created_at').notNull()});
export const consultations = sqliteTable('consultations',{id:text('id').primaryKey(),userId:text('user_id').notNull(),eventKey:text('event_key').notNull().unique(),queryType:text('query_type').notNull(),queryMasked:text('query_masked').notNull(),status:text('status').notNull().default('demo'),createdAt:text('created_at').notNull()});
export const siteSettings = sqliteTable('site_settings',{id:text('id').primaryKey(),value:text('value').notNull(),updatedAt:text('updated_at').notNull()});
export const packages = sqliteTable('packages',{kind:text('kind').notNull().default('package'),id:text('id').primaryKey(),name:text('name').notNull(),description:text('description').notNull().default(''),priceCents:integer('price_cents').notNull(),bonusCents:integer('bonus_cents').notNull().default(0),credits:integer('credits').notNull().default(0),active:integer('active').notNull().default(1)});

export const customers=sqliteTable('customers',{id:text('id').primaryKey(),userId:text('user_id'),name:text('name').notNull(),email:text('email').notNull().default(''),phone:text('phone').notNull().default(''),address:text('address').notNull().default(''),notes:text('notes').notNull().default(''),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});
export const auditLogs=sqliteTable('audit_logs',{id:text('id').primaryKey(),actorId:text('actor_id').notNull(),action:text('action').notNull(),recordId:text('record_id').notNull(),createdAt:text('created_at').notNull()});
export const adminSecurity=sqliteTable('admin_security',{userId:text('user_id').primaryKey(),salt:text('salt').notNull(),passwordHash:text('password_hash').notNull(),version:text('version').notNull(),failedAttempts:integer('failed_attempts').notNull().default(0),lockedUntil:text('locked_until'),updatedAt:text('updated_at').notNull()});
