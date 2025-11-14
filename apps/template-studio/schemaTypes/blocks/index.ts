import { heroSectionSchema } from "@walter/sanity-blocks/schemas/hero-section";
import { ctaSchema } from "@walter/sanity-blocks/schemas/cta";
import { faqAccordion } from "./faq-accordion";
import { featureCardsIcon } from "./feature-cards-icon";
import { imageLinkCards } from "./image-link-cards";
import { subscribeNewsletter } from "./subscribe-newsletter";

export const pageBuilderBlocks = [
  heroSectionSchema,
  ctaSchema,
  featureCardsIcon,
  faqAccordion,
  imageLinkCards,
  subscribeNewsletter,
];
