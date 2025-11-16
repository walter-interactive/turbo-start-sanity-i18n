# Migration Guide: @workspace/logger

**From**: `apps/template-web/src/lib/logger.ts`  
**To**: `packages/logger/` (workspace package)  
**Breaking Change**: Import path only  
**Estimated Time**: 15 minutes

---

## Overview

This guide documents the migration process for moving the logger implementation from `apps/template-web` to a shared workspace package.

**What's Changing**:
- ✅ Import path: `@/lib/logger` → `@workspace/logger`
- ❌ NO code changes required beyond imports
- ❌ NO behavior changes
- ❌ NO API changes

---

## Prerequisites

Before starting the migration:

1. **Verify current usage**:
   ```bash
   # Find all files importing the logger
   rg "from ['\"]@/lib/logger['\"]" apps/template-web/src/
   ```
   
   Expected results:
   - `apps/template-web/src/i18n/routing.ts`
   - `apps/template-web/src/lib/logger.ts` (the logger file itself)

2. **Ensure workspace is clean**:
   ```bash
   git status
   # Should show no uncommitted changes (recommended but not required)
   ```

---

## Migration Steps

### Step 1: Create Logger Package

```bash
# Navigate to repository root
cd /Users/walter-mac/walter-interactive/turbo-start-sanity-i18n

# Create package structure
mkdir -p packages/logger/src

# Copy logger implementation to new package
cp apps/template-web/src/lib/logger.ts packages/logger/src/index.ts
```

### Step 2: Create Package Configuration

**packages/logger/package.json**:
```json
{
  "name": "@workspace/logger",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "sideEffects": false,
  "scripts": {
    "lint": "npx ultracite lint",
    "format": "npx ultracite fix",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "^5.9.2"
  }
}
```

**packages/logger/tsconfig.json**:
```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src/**/*"]
}
```

**packages/logger/README.md**:
```markdown
# @workspace/logger

Shared logging utility for the monorepo.

## Usage

\`\`\`typescript
import { logger, extractErrorInfo } from '@workspace/logger'

logger.info('Application started')
logger.error('Operation failed', { error: extractErrorInfo(err) })
\`\`\`

See `specs/012-shared-logger-package/` for full documentation.
```

### Step 3: Update Logger Source (Environment Safety)

Edit `packages/logger/src/index.ts` to add defensive `typeof` checks:

**Before**:
```typescript
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

function getEnvironment(): string {
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') return 'preview'
  if (isDevelopment()) return 'development'
  return 'unknown'
}
```

**After**:
```typescript
function isDevelopment(): boolean {
  return typeof process !== 'undefined' && 
         process.env?.NODE_ENV === 'development'
}

function getEnvironment(): string {
  if (typeof process === 'undefined') return 'unknown'
  if (process.env?.VERCEL_ENV === 'production') return 'production'
  if (process.env?.VERCEL_ENV === 'preview') return 'preview'
  if (isDevelopment()) return 'development'
  return 'unknown'
}
```

**Rationale**: Prevents `ReferenceError` in browser environments where `process` is not defined.

### Step 4: Install Dependencies

```bash
# Install dependencies (adds @workspace/logger to workspace)
pnpm install

# Add logger as dependency to template-web
cd apps/template-web
```

Edit `apps/template-web/package.json` dependencies:
```json
{
  "dependencies": {
    "@workspace/logger": "workspace:*",
    // ... other dependencies
  }
}
```

```bash
# Install updated dependencies
pnpm install
```

### Step 5: Update Import in template-web

**File**: `apps/template-web/src/i18n/routing.ts`

**Before**:
```typescript
import { logger } from '@/lib/logger'
```

**After**:
```typescript
import { logger } from '@workspace/logger'
```

### Step 6: Remove Old Logger File

```bash
# Delete the old logger file
rm apps/template-web/src/lib/logger.ts

# If lib/ directory is now empty, remove it
rmdir apps/template-web/src/lib/  # Will fail if directory not empty - that's okay
```

### Step 7: Verification

```bash
# 1. Type check template-web
cd apps/template-web
pnpm check-types
# Should pass with no errors

# 2. Build template-web
pnpm build
# Should succeed

# 3. Type check logger package
cd ../../packages/logger
pnpm check-types
# Should pass with no errors

# 4. Run lint across monorepo
cd ../..
pnpm lint
# Should pass (or show pre-existing issues unrelated to logger)

# 5. Verify no old imports remain
rg "from ['\"]@/lib/logger['\"]" apps/template-web/src/
# Should return no results
```

---

## Rollback Plan

If issues are encountered, rollback is simple:

### Option 1: Git Revert (if committed)
```bash
git revert <commit-hash>
```

### Option 2: Manual Rollback
```bash
# 1. Restore old logger file
git checkout HEAD -- apps/template-web/src/lib/logger.ts

# 2. Revert import in routing.ts
# Change: import { logger } from '@workspace/logger'
# Back to: import { logger } from '@/lib/logger'

# 3. Remove logger package dependency from template-web
# Edit apps/template-web/package.json and remove "@workspace/logger": "workspace:*"

# 4. Reinstall dependencies
pnpm install

# 5. Delete logger package (optional)
rm -rf packages/logger/
```

---

## Future Applications

When adding the logger to new applications (e.g., `template-studio`):

1. **Add dependency**:
   ```json
   // apps/template-studio/package.json
   {
     "dependencies": {
       "@workspace/logger": "workspace:*"
     }
   }
   ```

2. **Install**:
   ```bash
   pnpm install
   ```

3. **Use**:
   ```typescript
   import { logger } from '@workspace/logger'
   
   logger.info('Studio started')
   ```

---

## Verification Checklist

After migration, verify:

- [ ] `packages/logger/src/index.ts` exists with defensive `typeof process` checks
- [ ] `packages/logger/package.json` has `"sideEffects": false`
- [ ] `apps/template-web/package.json` includes `"@workspace/logger": "workspace:*"`
- [ ] `apps/template-web/src/i18n/routing.ts` imports from `@workspace/logger`
- [ ] `apps/template-web/src/lib/logger.ts` deleted
- [ ] `pnpm check-types` passes in template-web
- [ ] `pnpm build` succeeds in template-web
- [ ] `pnpm lint` passes (or shows only pre-existing issues)
- [ ] No old import paths remain (`rg` search returns empty)

---

## Common Issues & Solutions

### Issue: "Cannot find module '@workspace/logger'"

**Cause**: Dependencies not installed or package.json not updated.

**Solution**:
```bash
# Ensure package.json has the dependency
# Then reinstall
pnpm install
```

### Issue: "ReferenceError: process is not defined"

**Cause**: Missing defensive `typeof process` checks.

**Solution**: Follow Step 3 above to add environment safety checks.

### Issue: "Build succeeds but types are wrong"

**Cause**: TypeScript cache may be stale.

**Solution**:
```bash
# Clear TypeScript cache
rm -rf apps/template-web/.next
rm -rf apps/template-web/node_modules/.cache
pnpm build
```

### Issue: "sideEffects warning during build"

**Cause**: Missing `"sideEffects": false` in package.json.

**Solution**: Add to `packages/logger/package.json`:
```json
{
  "sideEffects": false
}
```

---

## Post-Migration

After successful migration:

1. **Update documentation**:
   - Update any code examples to use `@workspace/logger`
   - Update README files that reference the logger

2. **Communicate to team**:
   - Notify team of new import path
   - Update onboarding documentation

3. **Monitor**:
   - Check logs in development and production to ensure no regression
   - Verify bundle size hasn't increased significantly

---

**Migration Complete** ✅
