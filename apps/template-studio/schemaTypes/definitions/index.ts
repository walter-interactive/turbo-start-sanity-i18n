import { buttonSchema } from "@walter/sanity-atoms/schemas/button";
import { customUrlSchema } from "@walter/sanity-atoms/schemas/custom-url";
import { richText } from "@walter/sanity-atoms/schemas/rich-text";
import { pageBuilder } from "./pagebuilder";

export const definitions = [
  customUrlSchema,
  richText,
  buttonSchema,
  pageBuilder,
];
