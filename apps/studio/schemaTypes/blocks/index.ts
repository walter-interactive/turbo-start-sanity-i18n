import { heroSectionSchema } from "@workspace/sanity/schemas";
import { cta } from "./cta";
import { faqAccordion } from "./faq-accordion";
import { featureCardsIcon } from "./feature-cards-icon";
import { imageLinkCards } from "./image-link-cards";
import { subscribeNewsletter } from "./subscribe-newsletter";

export const pageBuilderBlocks = [
  heroSectionSchema,
  cta,
  featureCardsIcon,
  faqAccordion,
  imageLinkCards,
  subscribeNewsletter,
];
