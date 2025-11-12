# turbo-start-sanity-i18n Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-06

## Active Technologies
- TypeScript 5.x (strict mode), Node.js 18+ (003-dedup-studio-records)
- Sanity Content Lake (cloud-hosted, already configured) (003-dedup-studio-records)
- TypeScript 5.x (strictmode enabled per monorepo standards) (004-remove-orphaned-badge)
- Sanity Content Lake (cloud-hosted, no changes required) (004-remove-orphaned-badge)
- TypeScript/JavaScript (Node.js 20+) + N/A (content/metadata changes only) (002-remove-roboto-branding)
- N/A (no data persistence involved) (002-remove-roboto-branding)

- TypeScript 5.x (Next.js 15.x App Router, Node.js 18+) + next-intl (frontend i18n), @sanity/document-internationalization (CMS plugin), next-sanity (data fetching), groq (queries) (001-i18n-localization)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (Next.js 15.x App Router, Node.js 18+): Follow standard conventions

## Recent Changes
- 004-remove-orphaned-badge: Added TypeScript 5.x (strictmode enabled per monorepo standards)
- 003-dedup-studio-records: Added TypeScript 5.x (strict mode), Node.js 18+
- 002-remove-roboto-branding: Added TypeScript/JavaScript (Node.js 20+) + N/A (content/metadata changes only)

- 001-i18n-localization: Added TypeScript 5.x (Next.js 15.x App Router, Node.js 18+) + next-intl (frontend i18n), @sanity/document-internationalization (CMS plugin), next-sanity (data fetching), groq (queries)

<!-- MANUAL ADDITIONS START -->

## Sanity Studio: Preview System Constraints

**Important Architectural Limitation** (discovered during spec 004-remove-orphaned-badge):

Sanity Studio's `preview.prepare()` function is **synchronous-only** and cannot execute async operations or database queries. This creates significant limitations for preview logic:

### What Works ✅
- Accessing fields directly selected in `preview.select`
- Simple calculations and string formatting
- Conditional logic based on available fields
- Icon/emoji display

### What Doesn't Work ❌
- Async/await operations
- Database queries (GROQ, client.fetch)
- Querying related documents (e.g., translation.metadata)
- External API calls
- Promise-based logic

### Example: Orphaned Translation Detection

**Problem**: Attempted to detect "orphaned" translations (documents without default language version) in preview
**Implementation**: `const isOrphaned = language !== DEFAULT_LOCALE;`
**Result**: 60-80% false positive rate (marked all non-default language docs as orphaned)
**Root Cause**: Cannot query `translation.metadata` to verify if default language version exists
**Resolution**: Complete feature removal (spec 004)

### Lessons Learned

1. **Keep Preview Logic Simple**: Only use fields directly available in preview.select
2. **Avoid Complex Validations**: Preview is for display only, not validation
3. **False Positives Are Worse Than No Feature**: High false positive rate confuses users
4. **Async Detection Requires Custom Components**: Use Sanity Studio custom components for complex async logic
5. **Document Architectural Constraints**: Save investigation findings for future reference

### Alternative Approaches for Complex Preview Logic

If you need async data in previews:
1. **Custom Sanity Plugin**: Create custom list view component with async loading
2. **Background Jobs**: Pre-compute metadata and store in document fields
3. **Utility Scripts**: Separate admin tools for complex validation/reporting
4. **Client Components**: Use Sanity Studio custom components with async data fetching

### Reference Implementation

See `apps/studio/components/language-filter.ts:isDocumentOrphaned()` for example of correct async orphaned detection approach (used in utility functions, not preview).

---

## Feature Removal Best Practices

**Checklist for removing features** (learned from spec 004-remove-orphaned-badge):

1. **Code Cleanup**:
   - [ ] Remove logic from all affected files (search codebase thoroughly)
   - [ ] Delete unused component files
   - [ ] Remove unused imports (e.g., `DEFAULT_LOCALE` if only used for removed feature)
   - [ ] Simplify conditional logic
   - [ ] Verify zero references remain (use `rg` or `grep`)

2. **Verification**:
   - [ ] Type checking passes (`pnpm check-types` or equivalent)
   - [ ] Build succeeds
   - [ ] Linting passes
   - [ ] Dev server starts without errors
   - [ ] No missing component/import errors

3. **Documentation**:
   - [ ] Update original spec to mark requirement as removed
   - [ ] Create completion notes with before/after examples
   - [ ] Update investigation documents with resolution
   - [ ] Reference new spec from old spec
   - [ ] Document lessons learned

4. **Stakeholder Communication**:
   - [ ] Explain why removal is better than fixing
   - [ ] Provide before/after metrics (false positive rate, character reduction, etc.)
   - [ ] Suggest alternatives if feature becomes critical later

### Example Command Sequence

```bash
# 1. Remove logic from files
# (Edit schema files to remove conditional logic)

# 2. Delete component
rm apps/studio/components/unused-component.tsx

# 3. Verify no references
rg "UnusedComponent|unused-component" apps/studio/

# 4. Type check
pnpm --filter studio check-types

# 5. Build
pnpm --filter studio build

# 6. Test dev server
pnpm --filter studio dev
# (Check for errors, then Ctrl+C)
```

---

<!-- MANUAL ADDITIONS END -->
