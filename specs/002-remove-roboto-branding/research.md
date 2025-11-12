# Research: Remove Roboto Studio Branding

**Feature**: 002-remove-roboto-branding  
**Date**: Tue Nov 11 2025  
**Status**: Complete

## Overview

This document captures research findings for removing Roboto Studio branding from the repository while maintaining proper attribution. The research focused on identifying all current references, determining replacement values, and establishing a verification strategy.

## Current Branding Audit

### References Found

Repository-wide search conducted using:
```bash
rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!.opencode'
```

**Results** (excluding spec files created for this feature):

| File | Line(s) | Reference Type | Content |
|------|---------|----------------|---------|
| `README.md` | 183-188 | Attribution (KEEP) | Credits section acknowledging original template |
| `CODE_OF_CONDUCT.md` | ~74 | Contact | `hrithik@robotostudio.com` |
| `SECURITY.md` | ~7 | Contact | `hrithik@robotostudio.com` |
| `LICENSE` | 1 | Copyright | `Copyright (c) 2025 Roboto Studio` |
| `apps/web/src/lib/seo.ts` | 7 | Code | `title: "Roboto Studio Demo"` |
| `apps/web/src/lib/seo.ts` | 8 | Code | `description: "Roboto Studio Demo"` |
| `apps/web/src/lib/seo.ts` | 9 | Code | `twitterHandle: "@studioroboto"` |
| `apps/web/src/lib/seo.ts` | 10 | Code | `keywords: ["roboto", "studio", "demo", ...]` |

**Classification**:
- **Documentation**: 3 files (README, CODE_OF_CONDUCT, SECURITY)
- **Legal**: 1 file (LICENSE)
- **Code/Config**: 1 file (seo.ts)
- **Assets**: 0 files requiring updates (OG image is neutral/generic)
- **Package Metadata**: 0 files with Roboto Studio references

**Verdict**: Clean codebase with only 5 files requiring updates. No references found in package.json files, configuration files, or source code beyond the SEO defaults.

### Git Remote Verification

Current remote configuration:
```
origin  git@github.com:walter-interactive/turbo-start-sanity-i18n.git (fetch)
origin  git@github.com:walter-interactive/turbo-start-sanity-i18n.git (push)
```

**Status**: ✅ Already pointing to walter-interactive organization. No remote URL updates needed.

---

## Replacement Values

### Decision Matrix

| Current Value | Replacement | Rationale |
|---------------|-------------|-----------|
| `hrithik@robotostudio.com` | `walter@walter-interactive.com` | Primary contact for Walter Interactive |
| `Copyright (c) 2025 Roboto Studio` | `Copyright (c) 2025 Walter Interactive` | Current copyright holder |
| `"Roboto Studio Demo"` (title) | `"Next.js Sanity i18n Starter"` | Descriptive, neutral title |
| `"Roboto Studio Demo"` (description) | `"A modern full-stack monorepo template with Next.js, Sanity CMS, and comprehensive i18n support"` | Accurate feature description |
| `"@studioroboto"` (Twitter) | `"@walterintrctv"` | Walter Interactive's Twitter handle |
| `["roboto", "studio", "demo", ...]` | `["nextjs", "sanity", "i18n", "monorepo", "typescript", "template"]` | Accurate technical keywords |

**Notes**:
- Email domain assumed based on GitHub org name. Confirm actual contact email before implementation.
- Twitter handle format assumed. Verify actual handle or use empty string if none exists.
- All replacement values should be confirmed with team before proceeding to implementation.

---

## Attribution Format

### Research: OSS Attribution Patterns

Reviewed common open source attribution practices:

1. **Separate Credits/Attribution Section**: Most common approach for derivative works
2. **Prominent Placement**: Usually near bottom of README but clearly visible
3. **Direct Links**: Link to original repository and (optionally) original authors
4. **License Compliance**: Ensure derivative work respects original license terms

### Current Attribution (README.md lines 182-188)

```markdown
## Credits

This template is built upon the excellent work by [Roboto Studio](https://github.com/robotostudio) and their [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) template. We've extended it with comprehensive multi-language support (French/English) using next-intl and Sanity's document internationalization plugin.

**Original Template**: [robotostudio/turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity)

Thank you to the Roboto Studio team for creating such a solid foundation for Next.js + Sanity projects!
```

### Proposed Attribution (Enhanced)

```markdown
## Credits

This template is built upon the excellent work by [Roboto Studio](https://github.com/robotostudio) and their original [turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity) template. We've extended it with comprehensive internationalization features, including multi-language routing, content translation workflows, and locale-aware data fetching.

### Original Template

**Repository**: [robotostudio/turbo-start-sanity](https://github.com/robotostudio/turbo-start-sanity)  
**License**: [License Type] (verify from original repo)

Thank you to the Roboto Studio team for creating such a solid foundation for Next.js + Sanity monorepo projects.
```

**Decision**: The current attribution is clear and appropriate. Minor enhancements can be made to be more explicit about the original source, but the existing format is already compliant with OSS practices.

**Recommended**: Keep existing attribution format with minimal changes. Optionally add license type from original template for clarity.

---

## License Review

### Current License

File: `LICENSE` (root directory)

```
Copyright (c) 2025 Roboto Studio
```

**Observations**:
- License file appears incomplete (only shows copyright line in search results)
- Need to verify full license text to ensure it's appropriate for a derivative work
- Common options: MIT, Apache 2.0, GPL (if original uses copyleft)

### Required Actions

1. **Read Full License File**: Determine current license type (MIT, Apache, etc.)
2. **Check Original License**: Verify robotostudio/turbo-start-sanity license
3. **Update Copyright Holder**: Change to "Walter Interactive" or appropriate entity
4. **Verify Compatibility**: Ensure derivative work complies with original license terms
5. **Maintain License Type**: Keep same license type unless there's a specific reason to change

**Research Finding**: Need to perform license verification before implementation. This is a prerequisite for legal compliance.

---

## Testing Strategy

### Verification Plan

#### 1. Automated Search Verification

**Command**:
```bash
rg -i "roboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
```

**Expected Result**: Only `README.md` Credits section should appear in results

**Alternative Searches**:
```bash
rg -i "robotostudio" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
rg -i "studioroboto" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
rg -i "hrithik" --iglob '!node_modules' --iglob '!.git' --iglob '!pnpm-lock.yaml' --iglob '!specs' --iglob '!.opencode'
```

#### 2. Build Verification

**Commands**:
```bash
pnpm check-types  # Verify TypeScript compilation
pnpm lint         # Verify linting passes
pnpm build        # Verify all workspaces build successfully
```

**Expected Result**: All commands should exit with code 0 (success)

#### 3. Manual Review Checklist

- [ ] README.md title and intro reflect new ownership
- [ ] README.md Credits section properly acknowledges Roboto Studio
- [ ] CODE_OF_CONDUCT.md has correct contact email
- [ ] SECURITY.md has correct contact email
- [ ] LICENSE has correct copyright holder
- [ ] LICENSE type is appropriate for derivative work
- [ ] apps/web/src/lib/seo.ts has updated defaults
- [ ] No broken links in documentation
- [ ] No references to Roboto Studio outside Credits section

#### 4. Package Metadata Verification

Review all `package.json` files:
- [ ] Root `package.json`: name, description, author, repository
- [ ] `apps/web/package.json`: name, description
- [ ] `apps/studio/package.json`: name, description, keywords
- [ ] `packages/ui/package.json`: name, description
- [ ] `packages/typescript-config/package.json`: name, description

**Current Status**: Initial search showed no Roboto Studio references in package.json files. Verification step confirms they're already clean.

---

## Alternatives Considered

### Alternative 1: Complete Rebrand with New Repository

**Approach**: Create entirely new repository, copy code, start fresh history

**Pros**:
- Clean slate, no historical references
- Simpler from a "purity" perspective

**Cons**:
- Loses valuable git history
- More complex migration process
- Harder to track what changed from original
- Less respectful of original work's lineage

**Decision**: ❌ Rejected. Maintaining git history and attribution is more valuable and respectful.

### Alternative 2: Keep More Extensive Attribution

**Approach**: Add attribution comments in code files that were modified

**Pros**:
- Very clear lineage for every file
- Academic rigor in attribution

**Cons**:
- Clutters codebase with non-functional comments
- Not standard practice for OSS derivative works
- Maintenance burden (comments may become stale)

**Decision**: ❌ Rejected. Single Credits section in README is industry standard and sufficient.

### Alternative 3: Automated Script for All Updates

**Approach**: Write a script to find-and-replace all references

**Pros**:
- Fast execution
- Repeatable if needed

**Cons**:
- Risk of unintended replacements (e.g., in commit history)
- Less careful review of each change
- May miss context-dependent nuances

**Decision**: ⚠️ Partial Use. Use search tools to identify locations, but apply changes manually with review.

---

## Recommendations

### Implementation Approach

1. **Prerequisites** (MUST complete before implementation):
   - [ ] Confirm contact email: `walter@walter-interactive.com` or other
   - [ ] Confirm Twitter handle: `@walterintrctv` or other
   - [ ] Review original LICENSE from robotostudio/turbo-start-sanity
   - [ ] Verify copyright holder name: "Walter Interactive" or legal entity name

2. **Implementation Order** (suggested):
   1. Update LICENSE (legal compliance first)
   2. Update CODE_OF_CONDUCT.md (community guidelines)
   3. Update SECURITY.md (security contact)
   4. Update README.md (public-facing documentation)
   5. Update apps/web/src/lib/seo.ts (technical defaults)
   6. Run verification suite
   7. Commit changes

3. **Post-Implementation**:
   - Update OG image in follow-up task (separate from this feature)
   - Communicate rebrand to any existing users/forks
   - Update any external documentation referencing the repository

### Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing a reference | Medium | Low | Comprehensive search + manual review checklist |
| Incorrect license handling | Low | High | Verify original license before making changes |
| Breaking functionality | Very Low | Medium | Run full build + test suite after changes |
| Inadequate attribution | Low | Medium | Follow OSS attribution best practices |

---

## Conclusion

**Status**: ✅ Research complete, ready for implementation

**Key Findings**:
1. Only 5 files require updates (clean codebase)
2. Git remote already points to correct organization
3. Package metadata is already clean of Roboto Studio references
4. Current attribution format is appropriate and sufficient
5. Verification strategy is straightforward and comprehensive

**Prerequisites**: ✅ **ALL CONFIRMED**
- Contact email: `duy@walterinteractive.com`
- Copyright holder: `Walter Interactive`
- Twitter handle: `""` (empty)
- Original license: Existing LICENSE file (no external check needed)

**Next Steps**: Proceed to implementation using `quickstart.md` guide
