# Contracts: Rename Package Aliases from @walter to @workspace

**Date**: 2025-11-15
**Feature**: 011-rename-package-aliases

## Overview

This directory contains "contracts" defining the expected state of configuration files after the rename is complete. These contracts serve as validation specs to ensure the transformation is complete and correct.

Unlike traditional API contracts (REST endpoints, GraphQL schemas), these contracts define the **expected structure and content** of metadata files in the monorepo.

---

## Contract Files

| File | Purpose | Validation Method |
|------|---------|-------------------|
| `package-identifiers.contract.json` | Expected "name" fields in package.json files | Manual inspection or JSON schema validation |
| `package-dependencies.contract.json` | Expected dependency declarations in package.json files | Manual inspection or JSON schema validation |
| `tsconfig-paths.contract.json` | Expected path mappings in tsconfig.json files | Manual inspection or JSON schema validation |
| `import-statements.contract.md` | Expected import path patterns in source code | Grep validation (zero old imports, all new imports) |

---

## Validation Checklist

Use this checklist to verify each contract is satisfied after implementation:

### ✅ Package Identifiers Contract
- [ ] `packages/sanity-atoms/package.json` has `"name": "@workspace/sanity-atoms"`
- [ ] `packages/sanity-blocks/package.json` has `"name": "@workspace/sanity-blocks"`
- [ ] No package.json files contain `"name": "@walter/sanity-atoms"` or `"name": "@walter/sanity-blocks"`

**Validation Command**:
```bash
grep -r '"name":.*@walter/sanity' --include="package.json"
# Expected output: 0 matches
```

---

### ✅ Package Dependencies Contract
- [ ] `packages/sanity-blocks/package.json` declares dependency on `"@workspace/sanity-atoms": "workspace:*"`
- [ ] `apps/template-studio/package.json` declares dependencies on `"@workspace/sanity-atoms": "workspace:*"` and `"@workspace/sanity-blocks": "workspace:*"`
- [ ] `apps/template-web/package.json` declares dependencies on `"@workspace/sanity-atoms": "workspace:*"` and `"@workspace/sanity-blocks": "workspace:*"`
- [ ] No package.json files contain `"@walter/sanity-atoms"` or `"@walter/sanity-blocks"` in dependencies

**Validation Command**:
```bash
grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"
# Expected output: 0 matches
```

---

### ✅ TypeScript Path Mappings Contract
- [ ] Root `tsconfig.json` contains path mappings for `@workspace/sanity-atoms/schemas/*`, `@workspace/sanity-atoms/fragments/*`, `@workspace/sanity-blocks/schemas/*`, `@workspace/sanity-blocks/fragments/*`
- [ ] No tsconfig.json files contain path mappings for `@walter/sanity-atoms` or `@walter/sanity-blocks`
- [ ] All workspace-specific tsconfig.json files (if any) use `@workspace/*` prefix

**Validation Command**:
```bash
grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"
# Expected output: 0 matches
```

---

### ✅ Import Statements Contract
- [ ] All TypeScript/JavaScript files import from `@workspace/sanity-atoms` or `@workspace/sanity-blocks`
- [ ] Zero files contain `import ... from '@walter/sanity-atoms'` or `import ... from '@walter/sanity-blocks'`
- [ ] Zero files contain `export ... from '@walter/sanity-atoms'` or `export ... from '@walter/sanity-blocks'`
- [ ] Zero files contain dynamic imports like `import('@walter/sanity-atoms')`

**Validation Command**:
```bash
grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist
# Expected output: 0 matches
```

---

### ✅ pnpm Workspace Resolution Contract
- [ ] `pnpm install` completes successfully without errors
- [ ] `node_modules/@workspace/sanity-atoms` symlink exists
- [ ] `node_modules/@workspace/sanity-blocks` symlink exists
- [ ] `node_modules/@walter` directory does NOT exist
- [ ] `pnpm list --depth=0` shows `@workspace/sanity-atoms` and `@workspace/sanity-blocks` in dependency tree

**Validation Commands**:
```bash
# Run fresh install
pnpm install

# Check symlinks exist
ls -la node_modules/@workspace/sanity-atoms
ls -la node_modules/@workspace/sanity-blocks

# Verify old symlinks are gone
ls node_modules/@walter 2>&1 | grep "No such file or directory"

# Check dependency tree
pnpm list --depth=0 | grep @workspace/sanity
```

---

### ✅ Build & Type Checking Contract
- [ ] `pnpm check-types` passes for all workspaces
- [ ] `pnpm build` succeeds for all workspaces
- [ ] No TypeScript errors related to module resolution
- [ ] No build errors related to import paths

**Validation Commands**:
```bash
pnpm check-types
pnpm build
```

---

### ✅ Documentation Contract
- [ ] `README.md` uses `@workspace/sanity-*` in examples (if applicable)
- [ ] `CLAUDE.md` references `@workspace/sanity-*` instead of `@walter/sanity-*`
- [ ] Spec files in `specs/009-*` and `specs/010-*` updated to use `@workspace/sanity-*` (if they contain code examples)
- [ ] No markdown files contain outdated `@walter/sanity-*` references (except historical context if intentionally preserved)

**Validation Command**:
```bash
grep -rn '@walter/sanity' \
  --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=specs/011-rename-package-aliases  # Exclude current spec
# Expected output: 0 matches (or only intentional historical references)
```

---

## Success Criteria Mapping

Each contract maps directly to success criteria from the feature spec:

| Contract | Success Criteria |
|----------|------------------|
| Package Identifiers | SC-004 (100% of import statements use new alias) |
| Package Dependencies | SC-003 (zero module resolution errors) |
| TypeScript Path Mappings | SC-001 (zero TypeScript compilation errors), SC-005 (IDE autocomplete works) |
| Import Statements | SC-004 (100% of import statements use new alias) |
| pnpm Workspace Resolution | SC-003 (dependency installation completes successfully) |
| Build & Type Checking | SC-001 (type checking passes), SC-002 (build succeeds) |
| Documentation | SC-006 (documentation updated) |

---

## Post-Implementation Verification

After implementation is complete, run this comprehensive validation script:

```bash
#!/bin/bash
# validation.sh - Comprehensive contract validation

echo "🔍 Validating Package Identifiers Contract..."
if grep -r '"name":.*@walter/sanity' --include="package.json" > /dev/null 2>&1; then
  echo "❌ FAIL: Found old package names"
  grep -r '"name":.*@walter/sanity' --include="package.json"
  exit 1
else
  echo "✅ PASS: All package names updated"
fi

echo ""
echo "🔍 Validating Package Dependencies Contract..."
if grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json" > /dev/null 2>&1; then
  echo "❌ FAIL: Found old dependency references"
  grep -r '"@walter/sanity-atoms"\|"@walter/sanity-blocks"' --include="package.json"
  exit 1
else
  echo "✅ PASS: All dependencies updated"
fi

echo ""
echo "🔍 Validating TypeScript Path Mappings Contract..."
if grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json" > /dev/null 2>&1; then
  echo "❌ FAIL: Found old path mappings"
  grep -r '@walter/sanity-atoms\|@walter/sanity-blocks' --include="tsconfig.json"
  exit 1
else
  echo "✅ PASS: All path mappings updated"
fi

echo ""
echo "🔍 Validating Import Statements Contract..."
if grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist > /dev/null 2>&1; then
  echo "❌ FAIL: Found old import statements"
  grep -rn '@walter/sanity-atoms\|@walter/sanity-blocks' \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist
  exit 1
else
  echo "✅ PASS: All import statements updated"
fi

echo ""
echo "🔍 Validating pnpm Workspace Resolution Contract..."
if ! pnpm install > /dev/null 2>&1; then
  echo "❌ FAIL: pnpm install failed"
  exit 1
fi

if [ ! -L "node_modules/@workspace/sanity-atoms" ]; then
  echo "❌ FAIL: node_modules/@workspace/sanity-atoms symlink missing"
  exit 1
fi

if [ ! -L "node_modules/@workspace/sanity-blocks" ]; then
  echo "❌ FAIL: node_modules/@workspace/sanity-blocks symlink missing"
  exit 1
fi

if [ -d "node_modules/@walter" ]; then
  echo "❌ FAIL: Old node_modules/@walter directory still exists"
  exit 1
fi

echo "✅ PASS: pnpm workspace resolution correct"

echo ""
echo "🔍 Validating Build & Type Checking Contract..."
if ! pnpm check-types > /dev/null 2>&1; then
  echo "❌ FAIL: Type checking failed"
  pnpm check-types
  exit 1
else
  echo "✅ PASS: Type checking successful"
fi

if ! pnpm build > /dev/null 2>&1; then
  echo "❌ FAIL: Build failed"
  pnpm build
  exit 1
else
  echo "✅ PASS: Build successful"
fi

echo ""
echo "✅ All contracts validated successfully!"
```

**Usage**:
```bash
chmod +x validation.sh
./validation.sh
```

---

## Rollback Contract

If the rename must be rolled back, the inverse contract applies:

- All `@workspace/sanity-*` references revert to `@walter/sanity-*`
- Run `pnpm install` to restore old symlinks
- Validate `pnpm check-types && pnpm build` succeeds

**Rollback Validation**: Use the same validation script but invert the grep patterns (search for `@workspace/sanity-*` instead of `@walter/sanity-*`).
