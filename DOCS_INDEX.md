# Flavr Docs Index

Last updated: 2026-05-31
Purpose: Fast entry point for architecture, operations, deployment, and next tasks.

## Start Here

1. Architecture and current priorities:
- ARCHITECTURE_STATUS.md

2. Domain setup (Cloudflare + OAuth redirects):
- CUSTOM_DOMAIN_SETUP.md

3. Deployment references:
- DEPLOYMENT.md
- DEPLOYMENT_GUIDE.md
- DEPLOYMENT_GUIDE_SIMPLE.md
- DEPLOY_NOW.md

4. Environment and production config:
- PRODUCTION_ENV.md
- GOOGLE_OAUTH_SETUP.md
- SENTRY_SETUP.md
- CLOUDFLARE_MIGRATION.md

5. Data safety and recovery:
- BACKUP_STRATEGY.md

6. Testing:
- frontend/tests/README.md
- .github/workflows/e2e-tests.yml

## Recommended Mobile Session Flow

1. Open ARCHITECTURE_STATUS.md first.
2. Check latest commits on branch nuxt_js.
3. Work one focused task at a time.
4. Update ARCHITECTURE_STATUS.md section "Change Log for This Status File".
5. Commit with a clear prefix (feat, fix, docs, chore).

## Source of Truth Policy

- Canonical status file: ARCHITECTURE_STATUS.md
- Historical files kept for context only:
  - PROJECT_STATUS.md
  - STATUS.md
  - NEXT_STEPS.md

## Quick Ops Commands

```bash
# Latest commits
git log --oneline -n 10

# Local frontend
cd frontend && npm run dev

# Local backend
cd backend && npm run dev

# E2E tests
cd frontend && npm run test:e2e
```
