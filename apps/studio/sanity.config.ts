import { assist } from "@sanity/assist";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { iconPicker } from "sanity-plugin-icon-picker";
import { media } from "sanity-plugin-media";
import { SANITY_LANGUAGES } from "@workspace/i18n-config";

import { Logo } from "./components/logo";
import { locations } from "./location";
import { presentationUrl } from "./plugins/presentation-url";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { getPresentationUrl } from "./utils/helper";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET;
const title = process.env.SANITY_STUDIO_TITLE;

export default defineConfig({
  name: "default",
  title,
  icon: Logo,
  projectId,
  dataset: dataset ?? "production",
  releases: {
    enabled: true,
  },
  plugins: [
    presentationTool({
      resolve: {
        locations,
      },
      previewUrl: {
        origin: getPresentationUrl(),
        previewMode: {
          enable: "/api/presentation-draft",
        },
      },
    }),
    structureTool({
      structure,
    }),
    presentationUrl(),
    visionTool(),
    unsplashImageAsset(),
    media(),
    iconPicker(),
    assist(),
    documentInternationalization({
      supportedLanguages: SANITY_LANGUAGES,
      schemaTypes: [
        "page",
        "blog",
        "blogIndex",
        "navbar",
        "footer",
        "settings",
        "homePage",
        "faq",
      ],
    }),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") {
        return prev.filter(doc => ['author', 'page-fr', 'blog-fr', 'faq-fr', 'redirect'].includes(doc.templateId))
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: (prev) => {
      // List of schema types that use document internationalization
      const i18nTypes = [
        "page",
        "blog",
        "blogIndex",
        "navbar",
        "footer",
        "settings",
        "homePage",
        "faq",
      ];

      // Filter out default templates for internationalized types
      // This removes the "create without language" option
      const filtered = prev.filter(
        (template) => !i18nTypes.includes(template.id)
      );

      // Add custom templates
      return [
        ...filtered,
        {
          id: "nested-page-template",
          title: "Nested Page",
          schemaType: "page",
          value: (props: { slug?: string; title?: string }) => ({
            ...(props.slug
              ? { slug: { current: props.slug, _type: "slug" } }
              : {}),
            ...(props.title ? { title: props.title } : {}),
          }),
          parameters: [
            {
              name: "slug",
              type: "string",
            },
          ],
        },
      ];
    },
  },
});
