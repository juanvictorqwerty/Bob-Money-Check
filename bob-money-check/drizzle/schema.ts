import { pgTable, varchar, timestamp, text, integer, foreignKey, boolean, jsonb, unique, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { table } from "console";


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
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "used_receipts_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);
