import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookMarked,
  CogIcon,
  File,
  FileIcon,
  FileText,
  HomeIcon,
  type LucideIcon,
  MessageCircle,
  PanelBottom,
  PanelBottomIcon,
  PlusIcon,
  Settings2,
  TrendingUpDown,
  User,
} from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";
import { DEFAULT_LOCALE } from "@workspace/i18n-config";

import type { SchemaType, SingletonType } from "./schemaTypes";
import { getTitleCase } from "./utils/helper";

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: LucideIcon;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({ S, type, title, icon }: CreateSingleTon) => {
  const newTitle = title ?? getTitleCase(type);
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? File)
    .child(S.document().schemaType(type).documentId(type));
};

type CreateList = {
  S: StructureBuilder;
} & Base;

// This function creates a list item for a type. It takes a StructureBuilder instance (S),
// a type, an icon, and a title as parameters. It generates a title for the type if not provided,
// and uses a default icon if not provided. It then returns a list item with the generated or
// provided title and icon.

const createList = ({ S, type, icon, title, id }: CreateList) => {
  const newTitle = title ?? getTitleCase(type);
  return S.documentTypeListItem(type)
    .id(id ?? type)
    .title(newTitle)
    .icon(icon ?? File);
};

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
  context: StructureResolverContext;
};

/**
 * Creates a structure list item containing both an index singleton document and an orderable
 * list of documents. This is useful for content types that have an index/landing page alongside
 * a collection of items (e.g., Blog Index + Blog Posts).
 *
 * @param S - The StructureBuilder instance
 * @param index - Configuration for the singleton index document (e.g., blogIndex)
 * @param list - Configuration for the orderable list of documents (e.g., blog posts)
 * @param context - The StructureResolverContext from Sanity
 *
 * @returns A list item containing the index document and orderable document list
 *
 * @example
 * createIndexListWithOrderableItems({
 *   S,
 *   index: { type: "blogIndex", icon: BookMarked },
 *   list: { type: "blog", title: "Blogs", icon: FileText },
 *   context,
 * })
 *
 * @remarks
 * **Querying Ordered Documents:**
 *
 * Documents can be ordered using the `orderRank` field:
 * ```groq
 * *[_type == "blog" && language == $lang] | order(orderRank)
 * ```
 *
 * **With Document Internationalization:**
 *
 * When using the document-internationalization plugin, the `orderRank` field of alternate
 * locale documents won't be updated when reordering. To maintain consistent ordering across
 * all languages, you may need to query using the base document's orderRank.
 *
 * If your setup provides a reference to the base translation document, you can use:
 * ```groq
 * *[_type == "blog" && language == $lang] | order(coalesce(__i18n_base->orderRank, orderRank))
 * ```
 *
 * This ensures documents in all locales share the same order by falling back to the base
 * document's orderRank when available. Verify that the `__i18n_base` field exists in your
 * metadata documents, or adjust the query to match your translation setup.
 */
const createIndexListWithOrderableItems = ({
  S,
  index,
  list,
  context,
}: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type)
            ),
          orderableDocumentListDeskItem({
            type: list.type,
            S,
            context,
            icon: list.icon ?? File,
            title: `${listTitle}`,
            filter: "language == $lang",
            params: {
              lang: DEFAULT_LOCALE,
            },
            menuItems: [
              S.menuItem()
                .title(`Create new ${listTitle.slice(0, -1)}`)
                .icon(PlusIcon)
                .intent({
                  type: "create",
                  params: {
                    type: list.type,
                    template: `${list.type}-${DEFAULT_LOCALE}`,
                  },
                })
                .serialize(),
            ],
          }),
        ])
    );
};

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext
) =>
  S.list()
    .title("Content")
    .items([
      /***** HOMEPAGE *****/
      createSingleTon({ S, type: "homePage", icon: HomeIcon }),

      S.divider(),

      /***** PAGES *****/
      S.listItem()
        .title("Pages")
        .icon(FileIcon)
        .child(
          S.documentTypeList("page")
            .title("Pages")
            .filter("_type == $type && language == $lang")
            .params({ type: "page", lang: DEFAULT_LOCALE })
            // Force users to create the default language first to avoid orphaned translation records
            .initialValueTemplates([S.initialValueTemplateItem((`page-${DEFAULT_LOCALE}`))])
        ),

      /***** BLOGS *****/
      createIndexListWithOrderableItems({
        S,
        index: { type: "blogIndex", icon: BookMarked },
        list: { type: "blog", title: "Blogs", icon: FileText },
        context,
      }),

      /***** FAQs *****/
      S.listItem()
        .title("FAQs")
        .icon(MessageCircle)
        .child(
          S.documentTypeList("faq")
            .title("FAQs")
            .filter("_type == $type && language == $lang")
            .params({ type: "faq", lang: DEFAULT_LOCALE })
            // Force users to create the default language first to avoid orphaned translation records
            .initialValueTemplates([S.initialValueTemplateItem((`faq-${DEFAULT_LOCALE}`))])
        ),

      /***** AUTHORS *****/
      createList({ S, type: "author", title: "Authors", icon: User }),

      /***** REDIRECTS *****/
      createList({
        S,
        type: "redirect",
        title: "Redirects",
        icon: TrendingUpDown,
      }),

      S.divider(),

      /***** SITE CONFIG *****/
      S.listItem()
        .title("Site Configuration")
        .icon(Settings2)
        .child(
          S.list()
            .title("Site Configuration")
            .items([
              createSingleTon({
                S,
                type: "navbar",
                title: "Navigation",
                icon: PanelBottom,
              }),
              createSingleTon({
                S,
                type: "footer",
                title: "Footer",
                icon: PanelBottomIcon,
              }),
              createSingleTon({
                S,
                type: "settings",
                title: "Global Settings",
                icon: CogIcon,
              }),
            ])
        ),
    ]);
