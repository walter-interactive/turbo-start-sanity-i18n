# Data Model: Co-locate Page Builder Block Modules

**Feature**: 007-colocate-pagebuilder-modules
**Created**: 2025-11-13
**Status**: Not Applicable (N/A)

## Summary

This feature is a **code reorganization only** - there are no changes to data models, schemas, or content structure.

## Rationale

This refactoring moves files to new locations and reorganizes code, but preserves:

- **All Sanity schema definitions** - Identical field structures, validation rules, and preview configurations
- **All GROQ query results** - Identical data shapes and query responses
- **All component prop interfaces** - Identical TypeScript types
- **All content in Sanity Content Lake** - No CMS changes, no content migration needed

### What Changes

**File locations only**:
- Schema files move from `apps/studio/schemaTypes/blocks/` to `packages/sanity-blocks/src/[block-name]/`
- Component files move from `apps/web/src/components/sections/` to `apps/web/src/blocks/[BlockName]/`
- Fragment code extracted from monolithic `query.ts` into separate files

### What Stays the Same

**Data structure and behavior**:
- Schema field definitions (same fields, same types, same validation)
- GROQ query logic (same queries, same results)
- Component props (same TypeScript interfaces)
- Rendered output (identical UI, identical data flow)

## Verification

Success criteria (SC-002) from spec.md explicitly states:

> "All existing functionality continues to work without modification - all pages render identically, all queries return the same data structure."

This is a **zero-functional-change refactoring**. The data model before and after is identical.

## Example: Hero Block

### Before Refactoring
**Schema** (`apps/studio/schemaTypes/blocks/hero.ts`):
```typescript
export const hero = defineType({
  name: "hero",
  fields: [
    { name: "heading", type: "string" },
    { name: "excerpt", type: "text" },
    // ... more fields
  ]
})
```

**Fragment** (inline in `apps/web/src/lib/sanity/query.ts`):
```typescript
const heroBlock = /* groq */ `_type == "hero" => { ..., ${imageFragment}, ${buttonsFragment} }`
```

**Component** (`apps/web/src/components/sections/hero.tsx`):
```typescript
export const HeroBlock: FC<Props> = ({ heading, excerpt, ... }) => { /* ... */ }
```

### After Refactoring
**Schema** (`packages/sanity-blocks/src/hero-section/hero-section.schema.ts`):
```typescript
export const heroSectionSchema = defineType({
  name: "hero",              // SAME name
  fields: [
    { name: "heading", type: "string" },  // SAME fields
    { name: "excerpt", type: "text" },
    // ... SAME fields
  ]
})
```

**Fragment** (`packages/sanity-blocks/src/hero-section/hero-section.fragment.ts`):
```typescript
export const heroSectionFragment = /* groq */ `_type == "hero" => { ..., ${imageFragment}, ${buttonsFragment} }`
// SAME query logic
```

**Component** (`apps/web/src/blocks/HeroSection/HeroSection.tsx`):
```typescript
export const HeroSection: FC<Props> = ({ heading, excerpt, ... }) => { /* SAME implementation */ }
```

**Result**: Files moved, code identical, data model unchanged.

---

## Conclusion

No data model documentation needed for this feature. See `quickstart.md` for practical reorganization guide and `research.md` for architectural patterns.
