# Quickstart Guide: Multi-Tenant Agency Template Architecture

**Feature**: 008-multi-tenant-template
**Branch**: `008-multi-tenant-template`
**Estimated Time**: 3-4 hours

## Overview

This guide walks through implementing the multi-tenant agency template architecture refactor. The work is divided into sequential phases that can be completed and verified independently.

**Goal**: Transform monorepo into multi-tenant template architecture by:
1. Renaming apps to distinguish templates from future client projects
2. Creating `@walter/sanity-atoms` package for atomic content types
3. Reorganizing `@walter/sanity-blocks` with flat file structure
4. Establishing clear dependency hierarchy: apps → blocks → atoms

**Prerequisites**:
- ✅ Feature 007 (colocate-pagebuilder-modules) completed
- ✅ pnpm workspaces configured
- ✅ TurboRepo build system working
- ✅ Current build/type-check passing

## Phase 1: Create Sanity Atoms Package (30-45 min)

### Step 1.1: Create Package Structure

```bash
# Create directory
mkdir -p packages/sanity-atoms/src

# Create package.json
cat > packages/sanity-atoms/package.json << 'EOF'
{
  "name": "@walter/sanity-atoms",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./schemas": "./src/schemas.ts"
  },
  "scripts": {
    "lint": "npx ultracite lint",
    "format": "npx ultracite fix",
    "check-types": "tsc --noEmit"
  },
  "peerDependencies": {
    "@sanity/icons": "^3.6.0",
    "lucide-react": "^0.539.0",
    "sanity": "^4.4.1"
  },
  "devDependencies": {
    "@sanity/icons": "^3.6.0",
    "@workspace/typescript-config": "workspace:*",
    "sanity": "^4.4.1",
    "typescript": "^5.9.2"
  }
}
EOF

# Create tsconfig.json
cat > packages/sanity-atoms/tsconfig.json << 'EOF'
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create README
cat > packages/sanity-atoms/README.md << 'EOF'
# @walter/sanity-atoms

Atomic Sanity content types (primitive field definitions) used across blocks and documents.

## Contents

- **buttons**: CTA button field definition
- **image**: Image field with alt text and metadata
- **richText**: Portable text editor configuration

## Usage

```typescript
import { buttonsSchema, imageSchema, richTextSchema } from '@walter/sanity-atoms/schemas'
```

## Package Structure

Flat file structure for easy discovery:

```
src/
├── buttons.schema.ts
├── image.schema.ts
├── richText.schema.ts
└── schemas.ts  # Re-exports
```
EOF
```

**Verify**: Directory structure created correctly

```bash
ls -la packages/sanity-atoms/
# Expected: package.json, tsconfig.json, README.md, src/
```

### Step 1.2: Migrate Atom Schema Files

**Check what exists first**:

```bash
# See what's currently in shared
find packages/sanity/src/shared -name "*.schema.ts"
```

**Migrate buttons**:

```bash
# Copy buttons schema (preserves content, we'll convert to flat structure)
cp packages/sanity/src/shared/buttons/buttons.schema.ts packages/sanity-atoms/src/buttons.schema.ts

# Review and update imports if needed
# Make sure export name is consistent: `export const buttonsSchema`
```

**Migrate image**:

```bash
cp packages/sanity/src/shared/image/image.schema.ts packages/sanity-atoms/src/image.schema.ts
# Verify export: `export const imageSchema`
```

**Migrate richText**:

```bash
cp packages/sanity/src/shared/rich-text/rich-text.schema.ts packages/sanity-atoms/src/richText.schema.ts
# Verify export: `export const richTextSchema`
# Note: File renamed rich-text → richText for camelCase consistency
```

### Step 1.3: Create Aggregated Export

```bash
cat > packages/sanity-atoms/src/schemas.ts << 'EOF'
// Re-export all atomic schemas for convenient importing
export { buttonsSchema } from './buttons.schema'
export { imageSchema } from './image.schema'
export { richTextSchema } from './richText.schema'
EOF
```

### Step 1.4: Verify Atoms Package

```bash
# Install dependencies
pnpm install

# Type check
pnpm --filter @walter/sanity-atoms check-types

# Should succeed with no errors
```

**Checkpoint**: Atoms package created and type-checks successfully

---

## Phase 2: Reorganize Sanity Blocks Package (45-60 min)

### Step 2.1: Rename Package Directory

```bash
# Use git mv to preserve history
git mv packages/sanity packages/sanity-blocks

# Update package.json name
sed -i '' 's/"@workspace\/sanity"/"@walter\/sanity-blocks"/' packages/sanity-blocks/package.json
```

### Step 2.2: Add Atoms Dependency

Edit `packages/sanity-blocks/package.json`, add to dependencies:

```json
{
  "dependencies": {
    "@walter/sanity-atoms": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

### Step 2.3: Migrate Blocks to Flat Structure

**Check existing blocks**:

```bash
ls packages/sanity-blocks/src/blocks/
# Expected: cta/, faq-section/, hero-section/
```

**Migrate each block**:

```bash
# Hero Section
git mv packages/sanity-blocks/src/blocks/hero-section/hero-section.schema.ts packages/sanity-blocks/src/heroSection.schema.ts
git mv packages/sanity-blocks/src/blocks/hero-section/hero-section.fragment.ts packages/sanity-blocks/src/heroSection.fragment.ts

# CTA
git mv packages/sanity-blocks/src/blocks/cta/cta.schema.ts packages/sanity-blocks/src/cta.schema.ts
git mv packages/sanity-blocks/src/blocks/cta/cta.fragment.ts packages/sanity-blocks/src/cta.fragment.ts

# FAQ Section → FAQ Accordion (renamed for clarity)
git mv packages/sanity-blocks/src/blocks/faq-section/faq-section.schema.ts packages/sanity-blocks/src/faqAccordion.schema.ts
git mv packages/sanity-blocks/src/blocks/faq-section/faq-section.fragment.ts packages/sanity-blocks/src/faqAccordion.fragment.ts

# Remove now-empty directories
rmdir packages/sanity-blocks/src/blocks/hero-section
rmdir packages/sanity-blocks/src/blocks/cta
rmdir packages/sanity-blocks/src/blocks/faq-section
rmdir packages/sanity-blocks/src/blocks
```

**Remove shared directory** (atoms now in separate package):

```bash
rm -rf packages/sanity-blocks/src/shared
```

### Step 2.4: Update Block Schemas to Import Atoms

For each block schema file (e.g., `heroSection.schema.ts`), update imports:

**Before**:
```typescript
import { buttonsSchema } from '../shared/buttons/buttons.schema'
```

**After**:
```typescript
import { buttonsSchema } from '@walter/sanity-atoms/schemas'
```

**Quick find-and-replace** (review each file afterward):

```bash
cd packages/sanity-blocks/src

# Update imports in all schema files
# (This is a template - adjust based on actual import patterns)
find . -name "*.schema.ts" -exec sed -i '' "s|from '../shared/\(.*\)/\1.schema'|from '@walter/sanity-atoms/schemas'|g" {} \;
find . -name "*.schema.ts" -exec sed -i '' "s|from '../../shared/\(.*\)/\1.schema'|from '@walter/sanity-atoms/schemas'|g" {} \;
```

**Manual verification required**: Check each schema file to ensure:
- Imports use `@walter/sanity-atoms/schemas`
- Export names are camelCase (e.g., `export const heroSectionSchema`)
- Schema `name` field unchanged (e.g., `name: 'heroSection'`)

### Step 2.5: Update Aggregated Exports

Edit `packages/sanity-blocks/src/schemas.ts`:

```typescript
// Re-export all block schemas
export { heroSectionSchema } from './heroSection.schema'
export { ctaSchema } from './cta.schema'
export { faqAccordionSchema } from './faqAccordion.schema'

// Convenience array for Sanity Studio registration
export const allBlockSchemas = [
  heroSectionSchema,
  ctaSchema,
  faqAccordionSchema
]
```

Edit `packages/sanity-blocks/src/fragments.ts`:

```typescript
// Re-export all block fragments
export { heroSectionFragment } from './heroSection.fragment'
export { ctaFragment } from './cta.fragment'
export { faqAccordionFragment } from './faqAccordion.fragment'
```

### Step 2.6: Verify Blocks Package

```bash
pnpm --filter @walter/sanity-blocks check-types
# Should succeed with no errors
```

**Checkpoint**: Blocks package reorganized with flat structure and atoms dependency

---

## Phase 3: Rename Template Apps (30 min)

### Step 3.1: Rename Directories

```bash
# Rename apps using git mv
git mv apps/studio apps/template-studio
git mv apps/web apps/template-web
```

### Step 3.2: Update Package Names

Edit `apps/template-studio/package.json`:

```json
{
  "name": "template-studio"
}
```

Edit `apps/template-web/package.json`:

```json
{
  "name": "template-web"
}
```

### Step 3.3: Update Turbo Configuration

Edit `turbo.json` to reference new app names. Find and replace:
- `studio#` → `template-studio#`
- `web#` → `template-web#`

Example:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "template-studio#build": {
      "outputs": [".next/**"]
    },
    "template-web#build": {
      "outputs": [".next/**"]
    }
  }
}
```

### Step 3.4: Update Root package.json Workspaces

Edit root `package.json` if workspaces explicitly listed:

```json
{
  "workspaces": [
    "apps/template-studio",
    "apps/template-web",
    "packages/*"
  ]
}
```

Or if using globs (verify):

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Run**:

```bash
pnpm install
```

**Checkpoint**: Apps renamed successfully, workspaces recognized

---

## Phase 4: Update App Dependencies (30-45 min)

### Step 4.1: Update Template Studio Dependencies

Edit `apps/template-studio/package.json`, update dependencies:

**Before**:
```json
{
  "dependencies": {
    "@workspace/sanity": "workspace:*"
  }
}
```

**After**:
```json
{
  "dependencies": {
    "@walter/sanity-atoms": "workspace:*",
    "@walter/sanity-blocks": "workspace:*"
  }
}
```

**Run**:

```bash
pnpm install
```

### Step 4.2: Update Template Studio Imports

Find all imports of `@workspace/sanity` in studio app:

```bash
cd apps/template-studio
grep -r "@workspace/sanity" .
```

**Update imports**:

```typescript
// Before
import { heroSectionSchema, ctaSchema } from '@workspace/sanity/schemas'

// After
import { heroSectionSchema, ctaSchema, allBlockSchemas } from '@walter/sanity-blocks/schemas'
// Or simply:
import { allBlockSchemas } from '@walter/sanity-blocks/schemas'
```

**Example schemaTypes update** (likely in `apps/template-studio/schemaTypes/index.ts` or similar):

```typescript
import { allBlockSchemas } from '@walter/sanity-blocks/schemas'

export const schema = {
  types: [
    ...allBlockSchemas,
    // other document types
  ]
}
```

### Step 4.3: Update Template Web Dependencies

Edit `apps/template-web/package.json`:

```json
{
  "dependencies": {
    "@walter/sanity-blocks": "workspace:*"
  }
}
```

**Note**: Web app likely doesn't need atoms package directly (only blocks)

**Run**:

```bash
pnpm install
```

### Step 4.4: Update Template Web Imports

Find all imports of `@workspace/sanity` in web app:

```bash
cd apps/template-web
grep -r "@workspace/sanity" .
```

**Update imports**:

```typescript
// Before
import { heroSectionFragment, ctaFragment } from '@workspace/sanity/fragments'

// After
import { heroSectionFragment, ctaFragment } from '@walter/sanity-blocks/fragments'
```

**Example query update** (likely in `apps/template-web/src/lib/sanity/queries/` or similar):

```typescript
import { heroSectionFragment, ctaFragment } from '@walter/sanity-blocks/fragments'

const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    ...,
    pageBuilder[] {
      ${heroSectionFragment},
      ${ctaFragment}
    }
  }
`
```

**Checkpoint**: All app imports updated to use new package names

---

## Phase 5: Verification & Testing (30 min)

### Step 5.1: Type Checking

```bash
# Check all workspaces
pnpm check-types

# Should show zero errors
```

**If errors**: Review error messages, likely import path issues. Fix and re-run.

### Step 5.2: Build All Workspaces

```bash
# Full monorepo build
pnpm build

# Should succeed for all workspaces
```

### Step 5.3: Start Development Servers

**Terminal 1 - Studio**:

```bash
pnpm --filter template-studio dev
```

**Verify**:
- Server starts without errors
- Navigate to http://localhost:3333 (or configured port)
- Check Sanity Studio loads
- Verify all block types appear in schema
- Create/edit test document with page builder blocks

**Terminal 2 - Web App**:

```bash
pnpm --filter template-web dev
```

**Verify**:
- Server starts without errors
- Navigate to http://localhost:3000 (or configured port)
- Check pages load without errors
- Verify block content renders correctly
- Check browser console for errors

### Step 5.4: Verify Success Criteria

✅ **SC-001**: Navigate to `apps/` directory - see `template-studio` and `template-web` (clear distinction)

✅ **SC-002**: Check `packages/sanity-blocks/src/` - all files flat, camelCase naming

✅ **SC-003**: Check `packages/sanity-atoms/src/` - all atoms present (buttons, image, richText)

✅ **SC-004**: Test file location speed - open `packages/sanity-blocks/src/`, find `heroSection.schema.ts` (<5 seconds)

✅ **SC-005**: Studio loads with all blocks in interface

✅ **SC-006**: Web app queries blocks without errors

✅ **SC-007**: `pnpm build` succeeded (already verified)

✅ **SC-008**: `pnpm check-types` passed (already verified)

✅ **SC-009**: Both dev servers started without errors

✅ **SC-010**: TypeScript autocomplete works (test in IDE)

✅ **SC-011**: Verify dependency graph in package.json files:
- template-studio depends on sanity-blocks, sanity-atoms
- sanity-blocks depends on sanity-atoms
- sanity-atoms has no dependencies

✅ **SC-012**: No code duplication (blocks defined once in sanity-blocks, atoms defined once in sanity-atoms)

### Step 5.5: Verify Backward Compatibility

**Critical check**: Sanity schema names unchanged

```bash
# In Studio, go to Vision tool or schema inspector
# Verify schema names match previous:
# - heroSection (not hero-section)
# - cta
# - faqSection or faqAccordion (check which was original)
```

**Test existing content**:
- Open existing pages with page builder blocks
- Verify all content renders correctly
- No missing fields or broken references

---

## Phase 6: Commit & Documentation (15 min)

### Step 6.1: Review Changes

```bash
git status
git diff
```

**Expected changes**:
- Renamed directories (apps, packages)
- Updated package.json files
- Migrated files to flat structure
- Updated import paths

### Step 6.2: Commit

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: implement multi-tenant template architecture

- Rename apps to template-studio and template-web
- Create @walter/sanity-atoms package for atomic content types
- Reorganize @walter/sanity-blocks with flat file structure
- Establish clear dependency hierarchy: apps → blocks → atoms
- Update all import paths to use new package names
- Maintain backward compatibility (schema names unchanged)

Refs: #008-multi-tenant-template"
```

### Step 6.3: Update Documentation

**Update CLAUDE.md** (if exists at project root):

Add to "Recent Changes" or "Package Structure" section:

```markdown
## Package Structure (Updated 2025-11-14)

### Shared Packages

- **@walter/sanity-atoms**: Atomic content types (buttons, image, richText)
- **@walter/sanity-blocks**: Page builder block schemas and GROQ fragments
- **@walter/i18n-config**: Internationalization configuration

### Apps

- **template-studio**: Reference Sanity Studio implementation
- **template-web**: Reference Next.js web application

### Dependency Hierarchy

```
apps (template-studio, template-web)
  └── @walter/sanity-blocks
      └── @walter/sanity-atoms
```
```

### Step 6.4: Push Branch

```bash
git push origin 008-multi-tenant-template
```

---

## Troubleshooting

### Issue: Type errors after renaming packages

**Solution**: Delete node_modules and reinstall:

```bash
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue: Studio doesn't show blocks

**Check**:
1. Verify `allBlockSchemas` imported and added to schema types
2. Check browser console for import errors
3. Verify package exports in `package.json` match import paths

### Issue: Import paths not resolving

**Check**:
1. Verify workspace dependencies in package.json use `workspace:*`
2. Run `pnpm install` to update symlinks
3. Check TypeScript baseUrl/paths in tsconfig.json

### Issue: Git history lost for moved files

**Solution**: Git automatically tracks moves if >50% content similarity. If history lost:

```bash
# View file history across renames
git log --follow --find-renames=40% -- packages/sanity-blocks/src/heroSection.schema.ts
```

### Issue: Circular dependency errors

**Check**: Ensure atoms don't import from blocks, and blocks don't import from apps. Dependency flow should be uni-directional: apps → blocks → atoms

---

## Next Steps

After successful implementation and merge:

1. **Monitor**: Watch for any issues in development
2. **Document**: Update team documentation about new package structure
3. **Plan Phase 2**: Consider when to add `@walter/sanity-documents` package
4. **Plan Phase 4**: When ready to add first real client project

**Future features can now**:
- Import blocks from `@walter/sanity-blocks/schemas`
- Import atoms from `@walter/sanity-atoms/schemas`
- Create client apps following `client-name-studio`, `client-name-web` pattern
- Extend shared packages with new blocks/atoms

---

## Summary

**Completed**:
- ✅ Created `@walter/sanity-atoms` package with flat structure
- ✅ Reorganized `@walter/sanity-blocks` with flat structure and camelCase naming
- ✅ Renamed apps to `template-studio` and `template-web`
- ✅ Updated all import paths and dependencies
- ✅ Verified type checking, builds, and runtime behavior
- ✅ Maintained backward compatibility with existing content

**Time Investment**: ~3-4 hours

**Value Delivered**: Foundation for multi-tenant architecture enabling rapid client project scaffolding with zero code duplication
