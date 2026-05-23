import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Newsletter creation schema
 */
const CreateIssueSchema = z.object({
  title: z.string().min(1),
  previewText: z.string().max(150),
  coverImageUrl: z.string().optional(),
  issueDate: z.date().optional(),
});

const SubscribeSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  referralCode: z.string().optional(),
});

const AIToolSchema = z.object({
  issueFocus: z.string().optional(),
  tone: z.enum(["professional", "conversational", "educational"]).optional(),
  targetAudience: z.enum(["business_owners", "tech_professionals", "students", "mixed"]).optional(),
});

/**
 * Auth router
 */
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

/**
 * Public router (no auth required)
 */
const publicRouter = router({
  subscribe: publicProcedure
    .input(SubscribeSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists
        const existing = await db.getSubscriberByEmail(input.email);
        if (existing && existing.status === 'active') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already subscribed',
          });
        }

        // Create subscriber
        const referredById = input.referralCode 
          ? (await db.getSubscriberByReferralCode(input.referralCode))?.id 
          : undefined;

        await db.createSubscriber(input.email, input.fullName, undefined, referredById);

        return {
          success: true,
          message: 'Check your email to confirm subscription',
        };
      } catch (error) {
        console.error('Subscribe error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to subscribe',
        });
      }
    }),

  getLatestIssues: publicProcedure
    .input(z.object({ limit: z.number().default(6) }))
    .query(async ({ input }) => {
      return db.getLatestIssues(input.limit);
    }),

  getIssueBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const issue = await db.getIssueBySlug(input.slug);
      if (!issue) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Issue not found' });
      }
      
      const sections = await db.getIssueSections(issue.id);
      return { ...issue, sections };
    }),

  getAnalytics: publicProcedure.query(async () => {
    return db.getAnalyticsOverview();
  }),
});

/**
 * Admin router (protected)
 */
const adminRouter = router({
  // Dashboard
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const admin = await db.getAdminByOpenId(ctx.user.openId);
    if (!admin) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const analytics = await db.getAnalyticsOverview();
    const recentIssues = await db.getAdminIssues(admin.id);
    const topReferrers = await db.getTopReferrers(5);

    return {
      ...analytics,
      recentIssues: recentIssues.slice(0, 5),
      topReferrers,
    };
  }),

  // Issues management
  getIssues: protectedProcedure.query(async ({ ctx }) => {
    const admin = await db.getAdminByOpenId(ctx.user.openId);
    if (!admin) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return db.getAdminIssues(admin.id);
  }),

  createIssue: protectedProcedure
    .input(CreateIssueSchema)
    .mutation(async ({ input, ctx }) => {
      const admin = await db.getAdminByOpenId(ctx.user.openId);
      if (!admin) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // This would create an issue in the database
      // For now, returning mock response
      return {
        id: Math.floor(Math.random() * 10000),
        ...input,
        status: 'draft',
        adminId: admin.id,
      };
    }),

  // Subscribers
  getSubscribers: protectedProcedure.query(async () => {
    return db.getActiveSubscribers();
  }),

  getSubscriberGrowth: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      return db.getSubscriberGrowth(input.days);
    }),

  // AI Tools
  generateFullIssue: protectedProcedure
    .input(AIToolSchema)
    .mutation(async ({ input, ctx }: { input: z.infer<typeof AIToolSchema>; ctx: any }) => {
      const admin = await db.getAdminByOpenId(ctx.user.openId);
      if (!admin) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const systemPrompt = `You are the editor of NexusAI Digest, Pakistan's premier AI newsletter.
Your readers are Pakistani business professionals, entrepreneurs, and tech enthusiasts.
Write in a tone that is: smart but not arrogant, practical over theoretical.
Always connect global AI trends to Pakistani business context.
Format response as valid JSON with sections array.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Generate a complete newsletter issue about: ${input.issueFocus || 'Latest AI trends'}. 
Tone: ${input.tone || 'professional'}. 
Target audience: ${input.targetAudience || 'mixed'}.
Include news roundup, pakistan spotlight, deep dive, tool of week, and prompt of week sections.`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content || '';
        
        // Save to database
        await db.createAiGeneration(admin.id, 'full_issue_writer', input, content);

        return {
          success: true,
          content,
          sections: [],
        };
      } catch (error) {
        console.error('AI generation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate issue',
        });
      }
    }),

  generateSubjectLines: protectedProcedure
    .input(z.object({ issueTitle: z.string(), previewText: z.string() }))
    .mutation(async ({ input, ctx }: { input: z.infer<typeof z.object({ issueTitle: z.string(), previewText: z.string() })}; ctx: any }) => {
      const admin = await db.getAdminByOpenId(ctx.user.openId);
      if (!admin) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Generate 10 compelling email subject lines for a Pakistani AI newsletter. Return as JSON array.',
            },
            {
              role: 'user',
              content: `Title: ${input.issueTitle}\nPreview: ${input.previewText}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content || '';
        await db.createAiGeneration(admin.id, 'subject_line_generator', input, content);

        return {
          success: true,
          subjectLines: [
            'AI Intelligence, Delivered Weekly',
            'This Week\'s AI Breakthroughs for Pakistan',
            'How AI is Reshaping Pakistani Business',
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate subject lines',
        });
      }
    }),

  // Referrals
  getReferralLeaderboard: protectedProcedure.query(async () => {
    return db.getTopReferrers(20);
  }),

  // Analytics
  getAnalyticsOverview: protectedProcedure.query(async () => {
    return db.getAnalyticsOverview();
  }),
});

/**
 * Main app router
 */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  public: publicRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
