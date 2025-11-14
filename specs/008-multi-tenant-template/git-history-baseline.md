# Git History Baseline (T003)

**Date**: 2025-11-14
**Purpose**: Record file locations before migration to preserve git history tracking

## Files to be Moved/Renamed

### App Directories

| Current Path | New Path | Method |
|-------------|----------|--------|
| `apps/studio/` | `apps/template-studio/` | `git mv` |
| `apps/web/` | `apps/template-web/` | `git mv` |

### Package Directories

| Current Path | New Path | Method |
|-------------|----------|--------|
| `packages/sanity/` | `packages/sanity-blocks/` | `git mv` |

### Block Schema Files (Nested → Flat)

| Current Path | New Path | Method |
|-------------|----------|--------|
| `packages/sanity/src/blocks/hero-section/hero-section.schema.ts` | `packages/sanity-blocks/src/heroSection.schema.ts` | `git mv` |
| `packages/sanity/src/blocks/hero-section/hero-section.fragment.ts` | `packages/sanity-blocks/src/heroSection.fragment.ts` | `git mv` |
| `packages/sanity/src/blocks/cta/cta.schema.ts` | `packages/sanity-blocks/src/cta.schema.ts` | `git mv` |
| `packages/sanity/src/blocks/cta/cta.fragment.ts` | `packages/sanity-blocks/src/cta.fragment.ts` | `git mv` |
| `packages/sanity/src/blocks/faq-section/faq-section.schema.ts` | SKIP (empty file - 0 bytes) | N/A |
| `packages/sanity/src/blocks/faq-section/faq-section.fragment.ts` | SKIP (no schema to match) | N/A |

### Atomic Schema Files (To be copied to new package)

| Current Path | New Path | Method |
|-------------|----------|--------|
| `packages/sanity/src/shared/buttons/buttons.schema.ts` | `packages/sanity-atoms/src/buttons.schema.ts` | `cp` (new package) |
| `packages/sanity/src/shared/image/image.schema.ts` | `packages/sanity-atoms/src/image.schema.ts` | `cp` (new package) |
| `packages/sanity/src/shared/rich-text/rich-text.schema.ts` | `packages/sanity-atoms/src/richText.schema.ts` | `cp` (new package) |

**Note**: Atomic files will be COPIED (not moved) because they're going to a NEW package. Original files will be deleted after successful migration and verification.

## Git History Preservation Strategy

### Phase Ordering for Maximum History Retention

1. **Create new packages first** (sanity-atoms) - no history to preserve
2. **Rename package directory** (`packages/sanity/` → `packages/sanity-blocks/`) - preserves entire directory history
3. **Move block files within renamed package** - git will track as renames if >50% content similarity
4. **Rename app directories** - preserves entire directory history
5. **Update imports and references** - separate commits for clarity

### Git Commands for Tracking

After migration, verify history with:

```bash
# Check if git tracked the rename
git log --follow --oneline packages/sanity-blocks/src/heroSection.schema.ts

# View file history with renames
git log --follow --find-renames=40% --stat packages/sanity-blocks/src/heroSection.schema.ts

# Check blame with rename tracking
git blame -C -C packages/sanity-blocks/src/heroSection.schema.ts
```

## Current Git Status

```bash
git status --short
```

**Baseline Status**:
```
M CLAUDE.md
 M apps/studio/tsconfig.json
?? specs/008-multi-tenant-template/
?? specs/MULTI_TENANT_MONOREPO.md
```

## Commit Strategy

**Recommended**: Create multiple commits for clearer history:

1. **Commit 1**: Create sanity-atoms package
2. **Commit 2**: Rename packages/sanity → packages/sanity-blocks
3. **Commit 3**: Move block files to flat structure
4. **Commit 4**: Update block imports to use atoms package
5. **Commit 5**: Rename apps (studio → template-studio, web → template-web)
6. **Commit 6**: Update app imports and dependencies
7. **Commit 7**: Update turbo.json and root package.json

**Alternative**: Single commit for entire refactor (simpler but less granular history)

## Files NOT Being Moved

These files will be modified in place (import/export updates):

- `packages/sanity-blocks/src/schemas.ts` (updated exports)
- `packages/sanity-blocks/src/fragments.ts` (updated exports)
- `packages/sanity-blocks/package.json` (updated dependencies)
- `apps/template-studio/package.json` (updated dependencies)
- `apps/template-web/package.json` (updated dependencies)
- `turbo.json` (updated app references)
- Root `package.json` (updated workspace references)
