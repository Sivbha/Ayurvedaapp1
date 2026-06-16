# Handoff: Ayurveda App MVP → Claude Code

## Repository
- Local path: `C:\Users\Gautama\AppData\Local\Temp\opencode\ayurveda-app`
- GitHub: https://github.com/Sivbha/Ayush (push after local setup)

## Completed (OpenCode/DeepSeek V4)
- [x] Next.js 14 + Supabase + Tailwind + TypeScript
- [x] Auth (magic links, roles, middleware)
- [x] Database schema + RLS + migrations
- [x] 12-screen intake wizard with auto-save
- [x] Prakriti (4 screens) + Vikriti (4 screens) questionnaires
- [x] 7-day food diary + symptoms screen
- [x] 5 scoring engines (pure TS, tested)
- [x] Practitioner dashboard + client list
- [x] API routes for scoring + report generation
- [x] Report components (both types)
- [x] PDF generation stub

## For Claude Code (Priority Order)

### 1. Scoring Logic Refinement
- Edge cases in Prakriti dual-type detection
- Agni/Ama integration with food diary patterns
- Confidence scoring calibration
- Add more nuanced reasoning traces

### 2. Report Generation Intelligence
- Meal plan generation from templates + dietary preferences
- Herb recommendation logic with contraindication checking
- Yoga/breathwork personalization per dosha imbalance
- Dynamic disclaimer insertion based on red flags

### 3. UX Polish
- Framer Motion animations for wizard transitions
- Progressive disclosure in food diary (reduce cognitive load)
- Better mobile experience for 18-category chips
- Practitioner dashboard: drag-drop prioritization, bulk actions

### 4. Security & Production Hardening
- Rate limiting on API routes
- Audit logging for report access
- Field-level encryption for sensitive data
- CSP headers, HSTS
- Automated backup verification

### 5. Advanced Features (Phase 2+)
- i18n framework (EN/HI/TA)
- Seasonal Ritucharya based on location
- Follow-up assessment flow (2 weeks)
- Practitioner review workflow enhancements

## Known Issues
1. Food diary 18 checkboxes dense on mobile — needs progressive disclosure
2. Red flag handling: currently only blocks herbs; should it block report release?
3. Reproductive questions UX: hidden by default, needs better conditional display
4. No email notifications yet (Resend integration pending)

## Test Accounts
- Practitioner: practitioner@ayurveda.test / practitioner123
- Client: client@ayurveda.test / client123

## Commands
- `npm run dev` — local
- `npm run test` — unit tests
- `npm run test:e2e` — Playwright
- `npm run db:reset` — fresh Supabase local
