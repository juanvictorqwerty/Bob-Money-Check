import { pgTable, varchar, timestamp, text, integer, foreignKey, boolean, jsonb, unique, uuid, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const users = pgTable("users", {
	id: uuid().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }).notNull(),
},(table)=>[
	unique("users_email_unique").on(table.email)
]);

export const student=pgTable("student",{
	matricule: varchar({length:25}).primaryKey().notNull(),
	student_id: uuid("user_id").notNull(),
	due_sum: integer().default(365000).notNull(),
	excess_fees:integer().default(0).notNull()
},(table)=>[
	unique("matricule_unique").on(table.matricule),
	foreignKey({
		columns: [table.student_id],
		foreignColumns: [users.id],
		name: "Student_matricule"
	}).onUpdate("cascade").onDelete("restrict")
]);

export const clearance = pgTable("clearance", {
	id: uuid().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	userId: uuid("user_id").notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	active: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clearance_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const clearancesIndex = pgTable("clearances_Index", {
	id: uuid().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	userId: uuid("user_id").notNull(),
	clearanceId: jsonb("clearance_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clearances_Index_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const token = pgTable("token", {
	id: uuid().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	userId: uuid("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	dateCreated: timestamp("date_Created", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	dateEnded: timestamp("date_ended", { precision: 3, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "token_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const usedReceipts = pgTable("used_receipts", {
	id: varchar("id").notNull(),
	paymentDate: timestamp("PaymentDate", { precision: 3, mode: 'string' }).notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	clearanceId: uuid("clearance_id").notNull(),
}, (table) => [
	primaryKey({ 
		columns: [table.id, table.paymentDate],
		name: "used_receipts_pkey" 
	}),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "used_receipts_user_id_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.clearanceId],
		foreignColumns: [clearance.id],
		name: "used_receipts_clearance_id_fkey"
	}).onUpdate("cascade").onDelete("restrict")
]);
