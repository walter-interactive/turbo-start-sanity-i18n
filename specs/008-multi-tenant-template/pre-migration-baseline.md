# Pre-Migration Baseline Documentation

**Date**: 2025-11-14
**Purpose**: Document current state before Phase 1 migration (T001)

## Current Sanity Schema Names

### Blocks (packages/sanity/src/blocks/)

| Block | File Path | Schema Name | Export Name | Status |
|-------|-----------|-------------|-------------|--------|
| Hero Section | `blocks/hero-section/hero-section.schema.ts` | `"hero"` | `heroSectionSchema` | ✅ Implemented |
| CTA | `blocks/cta/cta.schema.ts` | `"cta"` | `cta` | ✅ Implemented |
| FAQ Section | `blocks/faq-section/faq-section.schema.ts` | N/A | N/A | ❌ Empty file (0 bytes) |

**Note**: Only 2 blocks are actually implemented. FAQ section has empty schema file but does have fragment file.

### Atomic/Shared Content Types (packages/sanity/src/shared/)

| Atom | File Path | Schema Name | Export Name | Status |
|------|-----------|-------------|-------------|--------|
| Buttons | `shared/buttons/buttons.schema.ts` | `"buttons"` | `buttonsFieldSchema` | ✅ Implemented |
| Image | `shared/image/image.schema.ts` | Unknown | Unknown | ✅ File exists |
| Rich Text | `shared/rich-text/rich-text.schema.ts` | `"richText"` | `customRichText` | ✅ Implemented |

## Current File Structure

### Block Files

```
packages/sanity/src/blocks/
├── cta/
│   ├── cta.schema.ts (1.7K)
│   └── cta.fragment.ts (276B)
├── faq-section/
│   ├── faq-section.schema.ts (0B - EMPTY)
│   └── faq-section.fragment.ts (656B)
└── hero-section/
    ├── hero-section.schema.ts (2.4K)
    └── hero-section.fragment.ts (376B)
```

### Shared/Atomic Files

```
packages/sanity/src/shared/
├── buttons/
│   └── buttons.schema.ts
├── image/
│   └── image.schema.ts
└── rich-text/
    └── rich-text.schema.ts
```

### Root Exports

```
packages/sanity/src/
├── schemas.ts (exports: heroSectionSchema, cta, buttonsFieldSchema, customRichText)
└── fragments.ts (exports: GROQ fragments)
```

## Critical Preservation Requirements

**Schema names MUST remain unchanged after migration**:
- ✅ `"hero"` → Will become file `heroSection.schema.ts` but schema name stays `"hero"`
- ✅ `"cta"` → Will become file `cta.schema.ts` with schema name `"cta"`
- ✅ `"buttons"` → Will become file `buttons.schema.ts` with schema name `"buttons"`
- ✅ `"richText"` → Will become file `richText.schema.ts` with schema name `"richText"`

## Migration Notes

1. **FAQ Section**: Empty schema file - will NOT be migrated (per FR-026-029 "if exists" caveat)
2. **Blocks to migrate**: 2 blocks only (hero, cta)
3. **Atoms to migrate**: 3 atoms (buttons, image, richText)
4. **File renaming pattern**:
   - `hero-section.schema.ts` → `heroSection.schema.ts` (kebab-case → camelCase)
   - `cta.schema.ts` → `cta.schema.ts` (no change needed)
   - `faq-section.schema.ts` → NOT migrated (empty file)
   - `rich-text.schema.ts` → `richText.schema.ts` (kebab-case → camelCase)

## Verification Checklist After Migration

- [ ] Schema name `"hero"` unchanged in heroSection.schema.ts
- [ ] Schema name `"cta"` unchanged in cta.schema.ts
- [ ] Schema name `"buttons"` unchanged in buttons.schema.ts
- [ ] Schema name `"richText"` unchanged in richText.schema.ts
- [ ] Export name `heroSectionSchema` maintained (not `heroSchema`)
- [ ] Export name `cta` maintained (exported as `cta`, not `ctaSchema`)
- [ ] All existing Sanity content still renders correctly
