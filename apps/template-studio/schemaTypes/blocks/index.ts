import { heroSectionSchema } from "@walter/sanity-blocks/schemas/hero-section";
import { ctaSchema } from "@walter/sanity-blocks/schemas/cta";
import { faqAccordionSchema } from "@walter/sanity-blocks/schemas/faq-accordion";
import { featureCardsIconSchema } from "@walter/sanity-blocks/schemas/feature-cards-icon";
import { imageLinkCardsSchema } from "@walter/sanity-blocks/schemas/image-link-cards";
import { subscribeNewsletterSchema } from "@walter/sanity-blocks/schemas/subscribe-newsletter";

export const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIconSchema,
  faqAccordionSchema,
  imageLinkCardsSchema,
  subscribeNewsletterSchema,
];
