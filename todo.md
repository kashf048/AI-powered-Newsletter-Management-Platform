# NexusAI Digest — Implementation TODO

## Database & Backend Setup
- [ ] Database schema: subscribers, issues, sections, sponsors, email_events, referrals, ai_generations
- [ ] tRPC routers: auth, public, subscribers, issues, sponsors, analytics, referrals, ai_studio
- [ ] Email/notification service integration
- [ ] AI tools service (10 tools via LLM)

## Public Website
- [ ] Landing page (hero, stats, featured issue, sections, past issues grid, referral teaser)
- [ ] Issues archive page (search, filters, grid)
- [ ] Single issue reader page (responsive, all section types)
- [ ] Subscribe page (multi-step form)
- [ ] Confirm email page
- [ ] Unsubscribe page
- [ ] Referral landing page

## Admin Panel
- [ ] Admin layout (sidebar, header, navigation)
- [ ] Dashboard (stats, charts, recent issues, top referrers)
- [ ] Issues list (table with filters)
- [ ] Issue editor (rich text, sections, drag-drop)
- [ ] Subscribers page (table, filters, bulk actions)
- [ ] AI Studio (10 tools interface)
- [ ] Sponsors page (management, revenue tracking)
- [ ] Referrals page (leaderboard, rewards)
- [ ] Analytics page (charts, metrics)
- [ ] Settings page (profile, newsletter config)

## State Management & Utilities
- [ ] Zustand stores (auth, editor, ui)
- [ ] API client setup
- [ ] Form validation (React Hook Form + Zod)
- [ ] Type definitions

## Testing & Polish
- [ ] Vitest tests for critical paths
- [ ] Responsive design verification
- [ ] Animation/motion polish
- [ ] Error handling & edge cases

## Deployment Ready
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] First admin user created
- [ ] End-to-end testing
