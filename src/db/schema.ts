import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  currency: text('currency').default('INR').notNull(),
  refreshInterval: text('refresh_interval').default('15').notNull(),
  favoriteCoins: text('favorite_coins').default('["bitcoin","ethereum","tether","binancecoin","solana"]').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const trackedWallets = pgTable('tracked_wallets', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  walletAddress: text('wallet_address').notNull(),
  chain: text('chain').notNull(), // 'ethereum', 'bitcoin', 'solana', 'binance-smart-chain'
  label: text('label').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const priceAlerts = pgTable('price_alerts', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  coinId: text('coin_id').notNull(),
  symbol: text('symbol').notNull(),
  targetPriceInr: text('target_price_inr').notNull(),
  condition: text('condition').notNull(), // 'GREATER_THAN', 'LESS_THAN'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userPortfolios = pgTable('user_portfolios', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  coinId: text('coin_id').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  amount: text('amount').notNull(),
  buyPriceInr: text('buy_price_inr').notNull(),
  buyDate: text('buy_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  preferences: one(userPreferences, {
    fields: [users.uid],
    references: [userPreferences.userUid],
  }),
  wallets: many(trackedWallets),
  alerts: many(priceAlerts),
  portfolios: many(userPortfolios),
  chats: many(chatMessages),
}));
