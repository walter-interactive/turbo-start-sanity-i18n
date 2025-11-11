# Agent Guidelines

## Build/Lint/Test Commands
- **Root**: `pnpm build` | `pnpm lint` | `pnpm format` | `pnpm check-types`
- **Web**: `pnpm --filter web dev` | `pnpm --filter web build` | `pnpm --filter web typecheck`
- **Studio**: `pnpm --filter studio dev` | `pnpm --filter studio build` | `pnpm --filter studio type` (regenerate Sanity types)
- **Single test**: No test suite configured

## Critical Rules
- **NEVER use `type any`** - Use specific types or `unknown`
- **File naming**: ALWAYS use kebab-case (e.g., `user-profile.tsx`, NOT `UserProfile.tsx`)
- **Extensions**: `.tsx` for React components, `.ts` for utilities
- **Imports**: Use `import type` and `export type` for types; use `node:` protocol for Node.js builtins
- **Functions**: Arrow functions over function expressions
- **No console**: Avoid `console.log()` - it's a linter warning

## Code Style
- **Layout**: Prefer `grid` over `flex` unless working with simple parent-child layouts
- **Semantic HTML**: Always use appropriate semantic elements
- **Components**: Use `SanityImage` for Sanity images; use `Buttons.tsx` resolver for buttons
- **i18n**: Use `start/end` instead of `left/right`, `ms/me` instead of `ml/mr` (when doing i18n work)

## Internationalization (i18n)
- **Routing**: All routes MUST be under `[locale]` segment (e.g., `app/[locale]/page.tsx`)
- **Static Rendering**: Call `setRequestLocale(locale)` at the top of ALL pages and layouts
- **Navigation**: Use i18n-aware components from `@/i18n/navigation` (Link, useRouter, usePathname)
  - NEVER use Next.js navigation directly for client-side routing
- **Translations**: Use `useTranslations('namespace')` in client components, `getTranslations()` in server components
- **Locale Access**: Server: `await params.locale`, Client: `useLocale()` hook
- **Message Files**: Keep organized by namespace in `messages/{locale}.json`
- **HTML Lang**: Root layout MUST include `<html lang={locale}>`

## Sanity Schemas
- Always use `defineField`, `defineType`, `defineArrayMember` from 'sanity'
- Include icon (lucide-react or @sanity/icons), description, name, title, and type for all fields
- File structure: `schemaTypes/{blocks,definitions,documents}/`
- After schema changes: Run `pnpm --filter studio type` to regenerate types
- **i18n Documents**: Add `language` field (string, readOnly, hidden) to all translatable document types
- **Plugin Config**: Include translatable types in `documentInternationalization` plugin's `schemaTypes` array

## GROQ Queries
- Use `defineQuery` and `groq` from 'next-sanity'
- Naming: camelCase + "Query" suffix (e.g., `getAllBlogsQuery`)
- Fragments: Prefix with underscore (e.g., `_richText`)
- Export response types when needed
- **i18n Queries**: ALWAYS filter by language using `language == $locale` in WHERE clause
- **Translation Metadata**: Use `translationsFragment` from `@/lib/sanity/i18n` to fetch all language versions
- **Helpers**: Use `createLocaleFilter()`, `createSlugLocaleFilter()` helpers for consistent filtering
- **Query Parameters**: Accept `locale` parameter in all content queries (type: `Locale` from `@/i18n/routing`)

## Error Handling
- Use try-catch with meaningful error messages
- Return structured responses: `{ success: boolean, data?: T, error?: string }`
- Never swallow errors silently
