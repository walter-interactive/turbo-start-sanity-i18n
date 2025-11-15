# Quickstart Guide: Rename Package Aliases from @walter to @workspace

**Date**: 2025-11-15
**Feature**: 011-rename-package-aliases
**Estimated Time**: 15-20 minutes

## Overview

This guide provides step-by-step instructions for safely renaming package aliases from `@walter/*` to `@workspace/*` in the turbo-start-sanity-i18n monorepo.

**What this changes**:
- Package names in package.json files
- Dependency declarations in package.json files
- TypeScript path mappings in tsconfig.json files
- Import statements in TypeScript/JavaScript files
- Documentation references

**What this does NOT change**:
- Any runtime behavior or business logic
- File or directory names
- Git history or commit messages

---

## Prerequisites

Before starting, ensure:

- [ ] You are on the `011-rename-package-aliases` branch
- [ ] Your working directory is clean (no uncommitted changes)
- [ ] You have pnpm 10.21.0+ installed
- [ ] Node.js 20+ is installed
- [ ] All dependencies are currently installed (`pnpm install` succeeded recently)

**Verify prerequisites**:
```bash
git status  # Should show clean working tree
git branch  # Should show 011-rename-package-aliases
pnpm --version  # Should be 10.21.0 or higher
node --version  # Should be v20.x.x or higher
```

---

## Step 1: Update Package Identifiers

Update the "name" field in both package.json files.

### 1.1 Update sanity-atoms package name

**File**: `packages/sanity-atoms/package.json`

```bash
# Open file in editor
code packages/sanity-atoms/package.json
# or
vim packages/sanity-atoms/package.json
```

**Change**:
```json
{
  "name": "@walter/sanity-atoms",
  ...
}
```

**To**:
```json
{
  "name": "@workspace/sanity-atoms",
  ...
}
```

### 1.2 Update sanity-blocks package name

**File**: `packages/sanity-blocks/package.json`

```bash
# Open file in editor
code packages/sanity-blocks/package.json
```

**Change**:
```json
{
  "name": "@walter/sanity-blocks",
  ...
}
```

**To**:
```json
{
  "name": "@workspace/sanity-blocks",
  ...
}
```

### 1.3 Update sanity-blocks dependency on sanity-atoms

**File**: `packages/sanity-blocks/package.json` (same file)

**Change**:
```json
{
  "dependencies": {
    "@walter/sanity-atoms": "workspace:*"
  }
}
```

**To**:
```json
{
  "dependencies": {
    "@workspace/sanity-atoms": "workspace:*"
  }
}
```

**Verification**:
```bash
grep -r '"name":.*@walter/sanity' --include="package.json"
# Expected: 0 results
```

---

## Step 2: Update Package Dependencies in Apps

Update dependency declarations in consuming applications.

### 2.1 Update template-studio dependencies

**File**: `apps/template-studio/package.json`

```bash
code apps/template-studio/package.json
```

**Find and replace** in the `dependencies` or `devDependencies` section:
- `"@walter/sanity-atoms": "workspace:*"` → `"@workspace/sanity-atoms": "workspace:*"`
- `"@walter/sanity-blocks": "workspace:*"` → `"@workspace/sanity-blocks": "workspace:*"`

### 2.2 Update template-web dependencies

**File**: `apps/template-web/package.json`

```bash
code apps/template-web/package.json
```

**Find and replace** in the `dependencies` or `devDependencies` section:
- `"@walter/sanity-atoms": "workspace:*"` → `"@workspace/sanity-atoms": "workspace:*"`
- `"@walter/sanity-blocks": "workspace:*"` → `"@workspace/sanity-blocks": "workspace:*"`

**Verification**:
```bash
grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"
# Expected: 0 results
```

---

## Step 3: Update TypeScript Path Mappings

Update path mappings in tsconfig.json files.

### 3.1 Update root tsconfig.json

**File**: `tsconfig.json` (root)

```bash
code tsconfig.json
```

**Change** the `paths` section from:
```json
{
  "compilerOptions": {
    "paths": {
      "@walter/sanity-atoms/schemas/*": [
        "./packages/sanity-atoms/src/*.schema.ts"
      ],
      "@walter/sanity-atoms/fragments/*": [
        "./packages/sanity-atoms/src/*.fragment.ts"
      ],
      "@walter/sanity-blocks/schemas/*": [
        "./packages/sanity-blocks/src/*.schema.ts"
      ],
      "@walter/sanity-blocks/fragments/*": [
        "./packages/sanity-blocks/src/*.fragment.ts"
      ]
    }
  }
}
```

**To**:
```json
{
  "compilerOptions": {
    "paths": {
      "@workspace/sanity-atoms/schemas/*": [
        "./packages/sanity-atoms/src/*.schema.ts"
      ],
      "@workspace/sanity-atoms/fragments/*": [
        "./packages/sanity-atoms/src/*.fragment.ts"
      ],
      "@workspace/sanity-blocks/schemas/*": [
        "./packages/sanity-blocks/src/*.schema.ts"
      ],
      "@workspace/sanity-blocks/fragments/*": [
        "./packages/sanity-blocks/src/*.fragment.ts"
      ]
    }
  }
}
```

### 3.2 Check for workspace-specific tsconfig.json overrides

**Search for other tsconfig.json files with custom path mappings**:
```bash
grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"
```

If any results are found, update those files following the same pattern (replace `@walter/` with `@workspace/`).

**Common locations to check**:
- `apps/template-studio/tsconfig.json`
- `apps/template-web/tsconfig.json`
- `packages/sanity-atoms/tsconfig.json`
- `packages/sanity-blocks/tsconfig.json`

**Verification**:
```bash
grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"
# Expected: 0 results
```

---

## Step 4: Update Import Statements in Source Code

Use bulk find-replace to update all import statements.

### 4.1 Identify all affected files

```bash
# List all files with old imports
grep -rl '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=.turbo

# Count of files (should be ~52)
grep -rl '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules | wc -l
```

### 4.2 Perform bulk find-replace

**Option A: Using `sed` (Linux/macOS)**
```bash
# Replace @walter/sanity-atoms → @workspace/sanity-atoms
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/.turbo/*" \
  -exec sed -i '' 's/@walter\/sanity-atoms/@workspace\/sanity-atoms/g' {} +

# Replace @walter/sanity-blocks → @workspace/sanity-blocks
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/.turbo/*" \
  -exec sed -i '' 's/@walter\/sanity-blocks/@workspace\/sanity-blocks/g' {} +
```

**Note for Linux users**: Remove the empty string `''` after `-i` flag:
```bash
sed -i 's/@walter\/sanity-atoms/@workspace\/sanity-atoms/g' {} +
```

**Option B: Using VS Code Find/Replace**
1. Open the project in VS Code
2. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+H` (Windows/Linux)
3. Search for: `@walter/sanity-atoms`
4. Replace with: `@workspace/sanity-atoms`
5. Click "Replace All"
6. Repeat for `@walter/sanity-blocks` → `@workspace/sanity-blocks`

**Option C: Using JetBrains IDEs (WebStorm, IntelliJ)**
1. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. Search for: `@walter/sanity-atoms`
3. Replace with: `@workspace/sanity-atoms`
4. Click "Replace All"
5. Repeat for `@walter/sanity-blocks`

### 4.3 Verify all imports updated

```bash
# Should return 0 results
grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules

# Count new imports (should be ~52 or more)
grep -rn '@workspace/sanity-atoms\|@workspace/sanity-blocks' \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules | wc -l
```

---

## Step 5: Update Documentation

Update markdown files referencing the old package names.

### 5.1 Search for documentation references

```bash
grep -rn '@walter/sanity' \
  --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=specs/011-rename-package-aliases
```

### 5.2 Update affected files

Common files to check:
- `CLAUDE.md` - Project-specific AI context
- `packages/sanity-atoms/README.md` - Package documentation
- `packages/sanity-blocks/README.md` - Package documentation
- `specs/009-complete-schema-migration/**/*.md` - Previous feature spec
- `specs/010-migrate-web-fragments/**/*.md` - Previous feature spec

**For each file found**:
1. Open the file
2. Replace `@walter/sanity-atoms` → `@workspace/sanity-atoms`
3. Replace `@walter/sanity-blocks` → `@workspace/sanity-blocks`

**Note**: Spec files in `specs/011-rename-package-aliases/` should remain untouched (they document the rename itself).

### 5.3 Verify documentation updated

```bash
grep -rn '@walter/sanity' \
  --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=specs/011-rename-package-aliases
# Expected: 0 results (or only intentional historical references)
```

---

## Step 6: Reinstall Dependencies

Regenerate pnpm lockfile and node_modules symlinks.

### 6.1 Remove old node_modules and lockfile

```bash
# Remove node_modules (optional but recommended for clean state)
rm -rf node_modules

# Keep pnpm-lock.yaml but let pnpm regenerate it
```

### 6.2 Reinstall all dependencies

```bash
pnpm install
```

**Expected output**:
- No errors during installation
- New symlinks created: `node_modules/@workspace/sanity-atoms` and `node_modules/@workspace/sanity-blocks`
- Old symlinks removed: `node_modules/@walter/` directory should not exist

### 6.3 Verify pnpm workspace resolution

```bash
# Verify new symlinks exist
ls -la node_modules/@workspace/sanity-atoms
ls -la node_modules/@workspace/sanity-blocks

# Verify old symlinks are gone (should error)
ls node_modules/@walter 2>&1 | grep "No such file or directory"

# Check dependency tree
pnpm list --depth=0 | grep @workspace/sanity
# Expected output:
# @workspace/sanity-atoms 0.0.0
# @workspace/sanity-blocks 0.0.0
```

---

## Step 7: Validate Changes

Run comprehensive validation to ensure rename succeeded.

### 7.1 Type checking

```bash
pnpm check-types
```

**Expected output**: Success with 0 errors

**If errors occur**:
- Check error messages for "Cannot find module '@walter/sanity-*'" → missed import statement
- Check for "Cannot find module '@workspace/sanity-*'" → tsconfig.json path mapping issue

### 7.2 Build all workspaces

```bash
pnpm build
```

**Expected output**: All workspaces build successfully

### 7.3 Linting (optional but recommended)

```bash
pnpm lint
```

**Expected output**: All linting checks pass

### 7.4 Run comprehensive validation script

If you created the `validation.sh` script from the contracts documentation:

```bash
chmod +x specs/011-rename-package-aliases/contracts/validation.sh
specs/011-rename-package-aliases/contracts/validation.sh
```

**Expected output**: All contracts pass

---

## Step 8: Commit Changes

Create a single atomic commit with all changes.

### 8.1 Review changes

```bash
git status
git diff
```

**Expected changes**:
- Modified: Multiple package.json files (package names and dependencies)
- Modified: Multiple tsconfig.json files (path mappings)
- Modified: Multiple .ts/.tsx files (import statements)
- Modified: Multiple .md files (documentation)
- Modified: pnpm-lock.yaml (regenerated with new package names)

### 8.2 Stage all changes

```bash
git add .
```

### 8.3 Commit with descriptive message

```bash
git commit -m "Rename package aliases from @walter to @workspace

- Updated package names in packages/sanity-atoms and packages/sanity-blocks
- Updated dependency declarations in template-studio and template-web
- Updated TypeScript path mappings in root and workspace tsconfig.json
- Updated all import statements from @walter/* to @workspace/*
- Updated documentation references (CLAUDE.md, README files, spec files)
- Regenerated pnpm-lock.yaml with new package names

Validates:
- Type checking passes (pnpm check-types)
- Build succeeds (pnpm build)
- All 52+ files with imports updated
- Zero references to @walter/sanity-* remain in codebase"
```

**Note**: This commit message follows the project's conventions (no Claude branding per CLAUDE.md rules).

---

## Step 9: Post-Commit Verification

Ensure commit is clean and complete.

### 9.1 Verify no uncommitted changes remain

```bash
git status
# Expected: "nothing to commit, working tree clean"
```

### 9.2 Run final validation

```bash
# Quick sanity check
pnpm check-types && pnpm build
```

### 9.3 Test IDE autocomplete (manual)

1. Open a TypeScript file in your IDE (e.g., `apps/template-studio/schemaTypes/index.ts`)
2. Start typing a new import: `import { imageSchema } from '@workspace/`
3. Verify IDE autocompletes with `@workspace/sanity-atoms/schemas/...`
4. Verify no autocomplete suggestions for `@walter/sanity-*`

---

## Step 10: Optional - Create Pull Request

If ready to merge to main branch:

```bash
# Push branch
git push origin 011-rename-package-aliases

# Create PR using GitHub CLI
gh pr create \
  --title "011-rename-package-aliases: Rename package aliases from @walter to @workspace" \
  --body "## Summary
- Renamed package aliases from @walter/* to @workspace/* for consistency
- Updated all package.json, tsconfig.json, and import statements
- Regenerated pnpm-lock.yaml with new package names

## Test Plan
- ✅ Type checking passes (\`pnpm check-types\`)
- ✅ Build succeeds (\`pnpm build\`)
- ✅ All 52+ files with imports updated
- ✅ Zero references to @walter/sanity-* remain in codebase
- ✅ IDE autocomplete works with new @workspace/* prefix

## Changes
- Modified: packages/sanity-atoms/package.json (package name)
- Modified: packages/sanity-blocks/package.json (package name + dependency)
- Modified: apps/template-studio/package.json (dependencies)
- Modified: apps/template-web/package.json (dependencies)
- Modified: tsconfig.json (path mappings)
- Modified: 52+ TypeScript files (import statements)
- Modified: Documentation files (CLAUDE.md, README files, spec files)
- Modified: pnpm-lock.yaml (regenerated)"
```

---

## Troubleshooting

### Issue: "Cannot find module '@walter/sanity-atoms'" after rename

**Cause**: Missed import statement in source code

**Fix**:
```bash
# Find remaining old imports
grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules

# Manually update missed files
```

---

### Issue: "Cannot find module '@workspace/sanity-atoms'" after rename

**Cause**: TypeScript path mapping not updated or pnpm dependencies not reinstalled

**Fix**:
```bash
# Verify tsconfig.json has new path mappings
grep '@workspace/sanity-atoms' tsconfig.json

# Reinstall dependencies
pnpm install

# Restart IDE (TypeScript language service cache may be stale)
```

---

### Issue: IDE still suggests old @walter/* imports

**Cause**: IDE cache not cleared

**Fix**:
- **VS Code**: Reload window (Cmd+Shift+P → "Reload Window")
- **WebStorm/IntelliJ**: Invalidate caches (File → Invalidate Caches → Invalidate and Restart)

---

### Issue: Build succeeds but linting fails

**Cause**: Import statement formatting (unlikely but possible)

**Fix**:
```bash
# Auto-fix linting issues
pnpm format
```

---

### Issue: pnpm list shows both @walter and @workspace packages

**Cause**: Stale node_modules from before rename

**Fix**:
```bash
# Clean reinstall
rm -rf node_modules
pnpm install
```

---

## Rollback Procedure

If issues arise and you need to rollback:

### Option 1: Revert uncommitted changes
```bash
git reset --hard HEAD
pnpm install
```

### Option 2: Revert committed changes
```bash
git revert <commit-hash>
pnpm install
pnpm check-types && pnpm build
```

---

## Success Checklist

Before considering the rename complete, verify:

- [ ] All package.json "name" fields updated to `@workspace/*`
- [ ] All package.json dependencies updated to `@workspace/*`
- [ ] All tsconfig.json path mappings updated to `@workspace/*`
- [ ] All import statements updated to `@workspace/*`
- [ ] Documentation files updated (CLAUDE.md, README files, specs)
- [ ] `pnpm install` completed successfully
- [ ] `node_modules/@workspace/sanity-atoms` and `node_modules/@workspace/sanity-blocks` exist
- [ ] `node_modules/@walter` does NOT exist
- [ ] `pnpm check-types` passes with 0 errors
- [ ] `pnpm build` succeeds for all workspaces
- [ ] IDE autocomplete works with new `@workspace/*` prefix
- [ ] Grep for `@walter/sanity` returns 0 results (excluding spec 011)
- [ ] Git commit created with all changes
- [ ] No uncommitted changes remain

---

## Estimated Time

- **Step 1-3**: 5 minutes (manual package.json and tsconfig.json edits)
- **Step 4**: 2 minutes (bulk find-replace in IDE or sed)
- **Step 5**: 3 minutes (documentation updates)
- **Step 6**: 2 minutes (pnpm install)
- **Step 7**: 3 minutes (validation)
- **Step 8-9**: 2 minutes (commit and verification)

**Total**: ~15-20 minutes

---

## Next Steps

After completing this rename:

1. Proceed to `/speckit.tasks` command to generate task breakdown for implementation
2. Execute tasks following the generated tasks.md file
3. Create pull request for review
4. Merge to main branch after approval

For questions or issues, refer to:
- Feature spec: `specs/011-rename-package-aliases/spec.md`
- Implementation plan: `specs/011-rename-package-aliases/plan.md`
- Research findings: `specs/011-rename-package-aliases/research.md`
- Data model: `specs/011-rename-package-aliases/data-model.md`
- Contracts: `specs/011-rename-package-aliases/contracts/`
