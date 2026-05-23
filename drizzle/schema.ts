import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core admin user table (newsletter creator)
 */
export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  isSuperadmin: boolean("isSuperadmin").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Subscribers table
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }),
  status: mysqlEnum("status", ["pending", "active", "unsubscribed", "bounced", "complained"]).default("pending"),
  source: mysqlEnum("source", ["website", "referral", "import", "api", "social"]).default("website"),
  referralCode: varchar("referralCode", { length: 8 }).notNull().unique(),
  referredById: int("referredById"),
  referralCount: int("referralCount").default(0),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "premium"]).default("free"),
  confirmationToken: varchar("confirmationToken", { length: 255 }),
  confirmedAt: timestamp("confirmedAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  locationCity: varchar("locationCity", { length: 100 }),
  locationCountry: varchar("locationCountry", { length: 100 }).default("Pakistan"),
  tags: json("tags").$type<string[]>().default([]),
  customFields: json("customFields").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  statusIdx: index("status_idx").on(table.status),
}));

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * Issues (newsletter editions)
 */
export const issues = mysqlTable("issues", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  previewText: varchar("previewText", { length: 150 }),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "archived"]).default("draft"),
  issueNumber: int("issueNumber").notNull().unique(),
  issueDate: timestamp("issueDate"),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  htmlContent: text("htmlContent"),
  webContent: text("webContent"),
  coverImageUrl: varchar("coverImageUrl", { length: 500 }),
  readingTimeMinutes: int("readingTimeMinutes").default(5),
  tags: json("tags").$type<string[]>().default([]),
  totalRecipients: int("totalRecipients").default(0),
  aiGenerated: boolean("aiGenerated").default(false),
  isPremium: boolean("isPremium").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  adminIdx: index("admin_idx").on(table.adminId),
  slugIdx: index("slug_idx").on(table.slug),
}));

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = typeof issues.$inferInsert;

/**
 * Issue sections
 */
export const issueSections = mysqlTable("issueSections", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issueId").notNull(),
  sectionType: mysqlEnum("sectionType", [
    "news_roundup",
    "tool_of_week",
    "pakistan_spotlight",
    "deep_dive",
    "prompt_of_week",
    "sponsor_slot",
    "quick_bites",
    "community",
    "jobs",
    "custom"
  ]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  htmlContent: text("htmlContent"),
  orderIndex: int("orderIndex").default(0),
  sponsorId: int("sponsorId"),
  aiGenerated: boolean("aiGenerated").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  issueIdx: index("issue_idx").on(table.issueId),
}));

export type IssueSection = typeof issueSections.$inferSelect;
export type InsertIssueSection = typeof issueSections.$inferInsert;

/**
 * Sponsors
 */
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull().unique(),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  status: mysqlEnum("status", ["prospect", "active", "paused", "inactive"]).default("prospect"),
  industry: varchar("industry", { length: 100 }),
  totalSpendPkr: decimal("totalSpendPkr", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;

/**
 * Sponsorships
 */
export const sponsorships = mysqlTable("sponsorships", {
  id: int("id").autoincrement().primaryKey(),
  sponsorId: int("sponsorId").notNull(),
  issueId: int("issueId").notNull(),
  sectionId: int("sectionId"),
  slotType: mysqlEnum("slotType", ["primary", "secondary", "text_only"]).default("primary"),
  adHeadline: varchar("adHeadline", { length: 255 }),
  adBody: text("adBody"),
  adCtaText: varchar("adCtaText", { length: 100 }),
  adCtaUrl: varchar("adCtaUrl", { length: 500 }),
  adImageUrl: varchar("adImageUrl", { length: 500 }),
  pricePkr: decimal("pricePkr", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["booked", "confirmed", "delivered", "cancelled"]).default("booked"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = typeof sponsorships.$inferInsert;

/**
 * Email events (for tracking opens, clicks, bounces)
 */
export const emailEvents = mysqlTable("emailEvents", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  issueId: int("issueId"),
  eventType: mysqlEnum("eventType", ["sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"]).notNull(),
  linkUrl: varchar("linkUrl", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  rawPayload: json("rawPayload").$type<Record<string, unknown>>(),
}, (table) => ({
  subscriberIdx: index("subscriber_idx").on(table.subscriberId),
  issueIdx: index("issue_idx").on(table.issueId),
  eventTypeIdx: index("eventType_idx").on(table.eventType),
}));

export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = typeof emailEvents.$inferInsert;

/**
 * Referral rewards
 */
export const referralRewards = mysqlTable("referralRewards", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  rewardType: mysqlEnum("rewardType", ["prompt_pack", "premium_month", "merch", "custom"]).notNull(),
  rewardName: varchar("rewardName", { length: 255 }).notNull(),
  milestoneCount: int("milestoneCount").notNull(),
  isClaimed: boolean("isClaimed").default(false),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

/**
 * AI generations (tracking all AI tool usage)
 */
export const aiGenerations = mysqlTable("aiGenerations", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  issueId: int("issueId"),
  toolType: mysqlEnum("toolType", [
    "full_issue_writer",
    "section_writer",
    "subject_line_generator",
    "email_rewriter",
    "news_summarizer",
    "pakistan_angle_finder",
    "prompt_creator",
    "sponsor_ad_writer",
    "headline_optimizer",
    "chat_assistant"
  ]).notNull(),
  inputData: json("inputData").$type<Record<string, unknown>>(),
  promptUsed: text("promptUsed"),
  aiResponse: text("aiResponse"),
  modelUsed: varchar("modelUsed", { length: 100 }),
  tokensUsed: int("tokensUsed").default(0),
  generationTimeMs: int("generationTimeMs").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  adminIdx: index("admin_idx").on(table.adminId),
  toolTypeIdx: index("toolType_idx").on(table.toolType),
}));

export type AiGeneration = typeof aiGenerations.$inferSelect;
export type InsertAiGeneration = typeof aiGenerations.$inferInsert;

/**
 * Relations
 */
export const adminsRelations = relations(admins, ({ many }) => ({
  issues: many(issues),
  aiGenerations: many(aiGenerations),
}));

export const subscribersRelations = relations(subscribers, ({ many, one }) => ({
  referrals: many(referralRewards),
  emailEvents: many(emailEvents),
  referredBy: one(subscribers, {
    fields: [subscribers.referredById],
    references: [subscribers.id],
  }),
}));

export const issuesRelations = relations(issues, ({ many, one }) => ({
  admin: one(admins, {
    fields: [issues.adminId],
    references: [admins.id],
  }),
  sections: many(issueSections),
  emailEvents: many(emailEvents),
  sponsorships: many(sponsorships),
}));

export const issueSectionsRelations = relations(issueSections, ({ one }) => ({
  issue: one(issues, {
    fields: [issueSections.issueId],
    references: [issues.id],
  }),
  sponsor: one(sponsors, {
    fields: [issueSections.sponsorId],
    references: [sponsors.id],
  }),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  sponsorships: many(sponsorships),
  sections: many(issueSections),
}));

export const sponsorshipsRelations = relations(sponsorships, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [sponsorships.sponsorId],
    references: [sponsors.id],
  }),
  issue: one(issues, {
    fields: [sponsorships.issueId],
    references: [issues.id],
  }),
}));

export const emailEventsRelations = relations(emailEvents, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [emailEvents.subscriberId],
    references: [subscribers.id],
  }),
  issue: one(issues, {
    fields: [emailEvents.issueId],
    references: [issues.id],
  }),
}));

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [referralRewards.subscriberId],
    references: [subscribers.id],
  }),
}));

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  admin: one(admins, {
    fields: [aiGenerations.adminId],
    references: [admins.id],
  }),
  issue: one(issues, {
    fields: [aiGenerations.issueId],
    references: [issues.id],
  }),
}));

/**
 * Legacy users table for Manus OAuth
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
