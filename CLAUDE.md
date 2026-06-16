# CLAUDE.md — Instructions for Ayurveda App

## Project Context
Wellness/educational Ayurveda assessment app. **Not medical diagnosis.**
Practitioner review gate required before client report release.

## Code Standards
- Server Components by default; Client Components only for interactivity
- Repository pattern: all DB access via `lib/storage/*`
- Scoring engines: pure functions, no side effects, fully tested
- Zod schemas for ALL form validation
- RLS policies are source of truth for authorization
- No direct Supabase calls in components — use storage layer

## Key Patterns
```typescript
// Server Component data fetching
const assessment = await getAssessment(id); // lib/storage/assessment.ts

// Client Component form
const form = useForm<BasicDetailsInput>({ resolver: zodResolver(basicDetailsSchema) });

// Server Action for mutations
export async function submitAssessment(data: BasicDetailsInput) {
  const supabase = await createServerClient();
  // ...
}
```

## Scoring Engine Contract
- Input: typed domain objects (from types/assessment.ts)
- Output: typed result objects with reasoning arrays
- Config: JSON in lib/rules/ — modify weights without code changes
- Tests: fixtures in tests/fixtures/assessments/

## Report Generation
- Practitioner report: comprehensive, technical, includes contradictions
- Client report: friendly, actionable, no jargon
- Both generated on-demand via API routes
- PDF via @react-pdf/renderer templates

## Security Requirements
- All PII behind RLS
- Service role only in lib/supabase/admin.ts
- No secrets in client bundles
- Audit log for report access (future)

## Testing
- Unit: vitest for scoring engines + utils
- Integration: API routes with test DB
- E2E: Playwright for critical flows (intake → report)

## Deployment
- Vercel for Next.js
- Supabase for DB/Auth/Storage
- Environment variables in Vercel dashboard
- Preview deployments on PRs
