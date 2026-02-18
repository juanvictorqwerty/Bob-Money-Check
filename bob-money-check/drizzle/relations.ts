import { relations } from "drizzle-orm/relations";
import { users, clearance, clearancesIndex, token, usedReceipts } from "./schema";

export const clearanceRelations = relations(clearance, ({one}) => ({
	user: one(users, {
		fields: [clearance.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	clearances: many(clearance),
	clearancesIndices: many(clearancesIndex),
	tokens: many(token),
	usedReceipts: many(usedReceipts),
}));

export const clearancesIndexRelations = relations(clearancesIndex, ({one}) => ({
	user: one(users, {
		fields: [clearancesIndex.userId],
		references: [users.id]
	}),
}));

export const tokenRelations = relations(token, ({one}) => ({
	user: one(users, {
		fields: [token.userId],
		references: [users.id]
	}),
}));

export const usedReceiptsRelations = relations(usedReceipts, ({one}) => ({
	user: one(users, {
		fields: [usedReceipts.userId],
		references: [users.id]
	}),
}));