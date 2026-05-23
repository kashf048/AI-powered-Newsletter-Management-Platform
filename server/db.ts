import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, admins, subscribers, issues, issueSections, sponsors, emailEvents, aiGenerations, referralRewards } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * User management (Manus OAuth)
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Admin helpers
 */
export async function getAdminByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(admins).where(eq(admins.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateAdmin(openId: string, email: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getAdminByOpenId(openId);
  
  if (existing) {
    await db.update(admins)
      .set({ email, name: name || existing.name, updatedAt: new Date() })
      .where(eq(admins.openId, openId));
    return existing;
  }

  const result = await db.insert(admins).values({
    openId,
    email,
    name: name || email.split('@')[0],
    isSuperadmin: openId === ENV.ownerOpenId,
  });
  
  return { openId, email, name: name || email.split('@')[0], isSuperadmin: openId === ENV.ownerOpenId };
}

/**
 * Subscriber helpers
 */
export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscriberByReferralCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscribers).where(eq(subscribers.referralCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscriber(email: string, fullName?: string, referralCode?: string, referredById?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const generatedCode = referralCode || generateReferralCode();
  
  const result = await db.insert(subscribers).values({
    email,
    fullName: fullName || undefined,
    referralCode: generatedCode,
    referredById: referredById || undefined,
    status: 'pending',
    source: 'website',
  });

  return { email, fullName, referralCode: generatedCode };
}

export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subscribers).where(eq(subscribers.status, 'active'));
}

export async function getSubscriberGrowth(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select().from(subscribers)
    .where(gte(subscribers.createdAt, startDate))
    .orderBy(subscribers.createdAt);
}

/**
 * Issue helpers
 */
export async function getIssueBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(issues).where(eq(issues.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLatestIssues(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(issues)
    .where(eq(issues.status, 'sent'))
    .orderBy(desc(issues.sentAt))
    .limit(limit);
}

export async function getIssueSections(issueId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(issueSections)
    .where(eq(issueSections.issueId, issueId))
    .orderBy(issueSections.orderIndex);
}

export async function getAdminIssues(adminId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(issues)
    .where(eq(issues.adminId, adminId))
    .orderBy(desc(issues.createdAt));
}

/**
 * Email event helpers
 */
export async function createEmailEvent(subscriberId: number, issueId: number | undefined, eventType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(emailEvents).values({
    subscriberId,
    issueId: issueId || undefined,
    eventType: eventType as any,
    occurredAt: new Date(),
  });
}

export async function getIssueOpenRate(issueId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const sent = await db.select({ count: sql`COUNT(*)` }).from(emailEvents)
    .where(and(eq(emailEvents.issueId, issueId), eq(emailEvents.eventType, 'sent')));
  
  const opened = await db.select({ count: sql`COUNT(DISTINCT subscriberId)` }).from(emailEvents)
    .where(and(eq(emailEvents.issueId, issueId), eq(emailEvents.eventType, 'opened')));
  
  const sentCount = sent[0]?.count as number || 0;
  const openedCount = opened[0]?.count as number || 0;
  
  return sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
}

/**
 * Referral helpers
 */
export async function getTopReferrers(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subscribers)
    .orderBy(desc(subscribers.referralCount))
    .limit(limit);
}

export async function getReferralRewards(subscriberId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(referralRewards)
    .where(eq(referralRewards.subscriberId, subscriberId));
}

/**
 * AI generation helpers
 */
export async function createAiGeneration(adminId: number, toolType: string, inputData: any, response: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(aiGenerations).values({
    adminId,
    toolType: toolType as any,
    inputData,
    aiResponse: response,
    modelUsed: 'llama-3.3-70b-versatile',
    tokensUsed: Math.ceil(response.length / 4), // Rough estimate
    generationTimeMs: 0,
  });
}

export async function getAdminAiGenerations(adminId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(aiGenerations)
    .where(eq(aiGenerations.adminId, adminId))
    .orderBy(desc(aiGenerations.createdAt))
    .limit(limit);
}

/**
 * Analytics helpers
 */
export async function getAnalyticsOverview() {
  const db = await getDb();
  if (!db) return null;

  const totalSubs = await db.select({ count: sql`COUNT(*)` }).from(subscribers);
  const activeSubs = await db.select({ count: sql`COUNT(*)` }).from(subscribers)
    .where(eq(subscribers.status, 'active'));
  const totalIssues = await db.select({ count: sql`COUNT(*)` }).from(issues)
    .where(eq(issues.status, 'sent'));

  return {
    totalSubscribers: totalSubs[0]?.count as number || 0,
    activeSubscribers: activeSubs[0]?.count as number || 0,
    totalIssuesSent: totalIssues[0]?.count as number || 0,
  };
}

/**
 * Utility
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
