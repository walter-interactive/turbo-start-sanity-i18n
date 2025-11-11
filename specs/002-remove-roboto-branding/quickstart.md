# Quickstart Guide: Remove Roboto Studio Branding

**Feature**: 002-remove-roboto-branding  
**Date**: Tue Nov 11 2025  
**For**: Implementation team

## Overview

This guide provides step-by-step instructions for removing Roboto Studio branding from the repository while maintaining proper attribution. The changes affect 5 files and require verification across the entire codebase.

## Prerequisites

Before starting implementation, confirm these values:

- [ ] **Contact Email**: _____________ (e.g., `walter@walter-interactive.com`)
- [ ] **Organization Name**: _____________ (e.g., `Walter Interactive`)
- [ ] **Twitter Handle**: _____________ (e.g., `@walterintrctv` or empty)
- [ ] **Original License Type**: _____________ (verify from robotostudio/turbo-start-sanity)
- [ ] **Copyright Holder**: _____________ (legal entity name)

**Stop**: Do not proceed until all values above are confirmed.

---

## Implementation Steps

### Step 1: Update LICENSE

**File**: `/LICENSE`

**Current** (line 1):
```
Copyright (c) 2025 Roboto Studio
```

**New**:
```
Copyright (c) 2025 [CONFIRMED_COPYRIGHT_HOLDER]
```

**Notes**:
- Verify full license text is appropriate (MIT, Apache 2.0, etc.)
- Ensure license type matches or is compatible with original template
- Keep all other license terms unchanged

---

### Step 2: Update CODE_OF_CONDUCT.md

**File**: `/CODE_OF_CONDUCT.md`

**Find and replace**:
```
hrithik@robotostudio.com
```

**With**:
```
[CONFIRMED_CONTACT_EMAIL]
```

**Expected**: 1 occurrence

**Verification**:
```bash
rg "hrithik@robotostudio.com" CODE_OF_CONDUCT.md
# Should return no results after change
```

---

### Step 3: Update SECURITY.md

**File**: `/SECURITY.md`

**Find and replace**:
```
hrithik@robotostudio.com
```

**With**:
```
[CONFIRMED_CONTACT_EMAIL]
```

**Expected**: 1 occurrence

**Verification**:
```bash
rg "hrithik@robotostudio.com" SECURITY.md
# Should return no results after change
```

---

### Step 4: Update README.md

**File**: `/README.md`

#### 4a. Update Title and Description (Lines 1-3)

**Current**:
```markdown
# Next.js Monorepo with Sanity CMS

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo with comprehensive multi-language support.
```

**New** (or similar):
```markdown
# Next.js Sanity i18n Starter

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo with comprehensive multi-language support for bilingual applications.
```

**Note**: Title change is optional but recommended to distinguish from original template.

#### 4b. Update Repository Image Link (Line 5)

**Current**:
```markdown
![Next.js Monorepo with Sanity CMS + i18n](https://raw.githubusercontent.com/walter-interactive/turbo-start-sanity-i18n/main/turbo-start-sanity-og.png)
```

**Verify**: URL already points to walter-interactive. ✅ No change needed.

#### 4c. Update Template Installation Instructions (Line 51)

**Current**:
```markdown
npm create sanity@latest -- --template walter-interactive/turbo-start-sanity-i18n
```

**Verify**: Already points to walter-interactive. ✅ No change needed.

#### 4d. Review Credits Section (Lines 182-188)

**Current**:
```markdown
## Credits

This template is built upon the excellent work by [Roboto Studio](https://github.com/robotostudio) and their [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) template. We've extended it with comprehensive multi-language support (French/English) using next-intl and Sanity's document internationalization plugin.

**Original Template**: [robotostudio/turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity)

Thank you to the Roboto Studio team for creating such a solid foundation for Next.js + Sanity projects!
```

**Decision**: ✅ **KEEP AS-IS**. This section properly attributes the original work and should remain unchanged.

**Optional Enhancement** (if desired):
```markdown
## Credits

This template is built upon the excellent foundation created by [Roboto Studio](https://github.com/robotostudio) and their [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) template. We've extended it with comprehensive internationalization features for bilingual applications, including multi-language routing, document-level translations, and locale-aware content fetching.

**Original Template**: [robotostudio/turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity)  
**License**: [Original License Type]

Thank you to the Roboto Studio team for creating such a solid foundation for Next.js + Sanity monorepo projects.
```

---

### Step 5: Update SEO Defaults

**File**: `/apps/web/src/lib/seo.ts`

**Current** (lines 6-11):
```typescript
export const DEFAULT_SEO_CONFIG = {
  title: "Roboto Studio Demo",
  description: "Roboto Studio Demo",
  twitterHandle: "@studioroboto",
  keywords: ["roboto", "studio", "demo", "sanity", "next", "react", "template"],
};
```

**New**:
```typescript
export const DEFAULT_SEO_CONFIG = {
  title: "Next.js Sanity i18n Starter",
  description: "A modern full-stack monorepo template with Next.js, Sanity CMS, and comprehensive i18n support",
  twitterHandle: "",
  keywords: ["nextjs", "sanity", "i18n", "monorepo", "typescript", "template", "react", "tailwind"],
};
```

**Notes**:
- Twitter handle is empty (no handle currently)
- Keywords updated to reflect actual template features
- Keep keywords lowercase and hyphenated (SEO best practice)

---

## Verification Checklist

After completing all changes, run these verification steps:

### 1. Search Verification

```bash
# Primary search - should return ONLY README.md Credits section
rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'

# Verify specific strings are removed
rg -i "robotostudio" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
rg -i "studioroboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
rg "hrithik@robotostudio.com" --iglob '!node_modules' --iglob '!.git' --iglob '!specs' --iglob '!.opencode'
```

**Expected Result**: Only `README.md` Credits section should contain "roboto"/"robotostudio" references.

### 2. Build & Type Check

```bash
# From repository root
pnpm check-types  # Should pass
pnpm lint         # Should pass
pnpm build        # Should succeed for all workspaces
```

**Expected Result**: All commands exit with code 0 (success).

### 3. Manual File Review

- [ ] `/LICENSE`: Copyright holder updated
- [ ] `/CODE_OF_CONDUCT.md`: Contact email updated
- [ ] `/SECURITY.md`: Contact email updated
- [ ] `/README.md`: Title/intro reflect new ownership
- [ ] `/README.md`: Credits section intact with proper attribution
- [ ] `/apps/web/src/lib/seo.ts`: All default values updated
- [ ] No broken links in documentation
- [ ] All changes use confirmed values: `duy@walterinteractive.com`, `Walter Interactive`, empty Twitter handle

### 4. Package Metadata Spot Check

```bash
# Should NOT find Roboto Studio references in package.json files
rg -i "roboto" --glob "package.json" --iglob '!node_modules'
```

**Expected Result**: No results (package.json files are already clean).

---

## Testing

### Functional Tests

No new tests required. Run existing test suite:

```bash
# If tests exist
pnpm test
```

**Expected Result**: All existing tests pass (branding changes should not affect functionality).

### Integration Verification

1. **Development Build**:
   ```bash
   pnpm dev
   ```
   - Open http://localhost:3000
   - Verify page title in browser tab matches new SEO title
   - Check page source for meta tags (should use new description)
   - Open http://localhost:3333 (Sanity Studio)
   - Verify Studio loads without errors

2. **Production Build**:
   ```bash
   pnpm build
   ```
   - Verify build succeeds for both apps/web and apps/studio
   - Check build output for any warnings related to changed files

---

## Rollback Plan

If issues are discovered after changes:

1. **Individual File Rollback**:
   ```bash
   git checkout HEAD~1 -- [FILE_PATH]
   ```

2. **Full Feature Rollback**:
   ```bash
   git revert [COMMIT_SHA]
   ```

3. **Verify Rollback**:
   - Run search verification again
   - Ensure builds still pass

---

## Common Issues & Solutions

### Issue 1: Search Returns Unexpected Results

**Symptom**: Ripgrep finds Roboto Studio references outside README.md Credits section

**Solution**:
1. Review each result individually
2. Verify whether it's in git history (expected) or current files (needs fixing)
3. Use `git log --all -S "robotostudio"` to check commit history references
4. Current files should be updated; historical commits remain unchanged

### Issue 2: Build Failures After Changes

**Symptom**: `pnpm build` fails after SEO file changes

**Solution**:
1. Check TypeScript errors: `pnpm check-types`
2. Verify seo.ts syntax is correct (commas, quotes, brackets)
3. Ensure DEFAULT_SEO_CONFIG export is unchanged (only values inside changed)
4. Check for typos in string values

### Issue 3: Linting Failures

**Symptom**: `pnpm lint` reports errors in changed files

**Solution**:
```bash
pnpm format  # Auto-fix formatting issues
pnpm lint    # Re-run to verify fixes
```

---

## Success Criteria Verification

Map to success criteria from `spec.md`:

- [ ] **SC-001**: Repository search returns Roboto Studio references only in README.md attribution
- [ ] **SC-002**: Documentation files reference our organization as owner
- [ ] **SC-003**: README.md Credits section links to robotostudio/turbo-start-sanity
- [ ] **SC-004**: Package.json files contain our organization's information (already verified as clean)
- [ ] **SC-005**: Existing test suite passes (if applicable)
- [ ] **SC-006**: Build process completes successfully for all packages
- [ ] **SC-007**: No Roboto Studio branding in markdown headings/titles (excluding Credits)
- [ ] **SC-008**: All documentation links point to our repository (except Credits attribution)

---

## Post-Implementation Tasks

After this feature is complete and merged:

1. **Optional Follow-ups**:
   - [ ] Update OG image (`turbo-start-sanity-og.png`) with new branding
   - [ ] Review GitHub repository settings (description, topics, URL)
   - [ ] Update any external documentation referencing the repository

2. **Communication**:
   - [ ] Inform team of rebrand completion
   - [ ] Update any internal documentation
   - [ ] Communicate to existing users/forks if applicable

3. **Monitoring**:
   - [ ] Watch for issues from users expecting Roboto Studio branding
   - [ ] Monitor repository stars/forks for any unexpected patterns

---

## Notes

### Why These Files?

- **LICENSE**: Legal requirement to reflect current copyright holder
- **CODE_OF_CONDUCT.md**: Community guidelines require accurate contact
- **SECURITY.md**: Security reports need to reach the right team
- **README.md**: Primary public-facing documentation
- **seo.ts**: Technical defaults for production application

### Why Not These Files?

- **package.json** files: Already clean, no Roboto Studio references
- **Source code**: No branding references found in application logic
- **Git history**: Immutable and should remain for historical accuracy
- **Dependencies**: Third-party packages remain unchanged

---

## Estimated Time

- Prerequisites verification: **15 minutes**
- File updates: **30 minutes**
- Verification: **15 minutes**
- Testing: **15 minutes**

**Total**: ~75 minutes for careful, thorough implementation

---

## Questions?

If any issues arise during implementation:

1. Check this quickstart guide for solutions
2. Review `research.md` for context and decisions
3. Consult `spec.md` for requirements and success criteria
4. Refer to `plan.md` for overall feature scope

**Contact**: [Implementation team lead] for questions or blockers
