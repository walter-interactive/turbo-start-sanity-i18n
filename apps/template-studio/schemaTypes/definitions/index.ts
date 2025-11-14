import { buttonSchema } from "@walter/sanity-atoms/schemas/button";
import { customUrlSchema } from "@walter/sanity-atoms/schemas/custom-url";
import { pageBuilder } from "./pagebuilder";
import { richText } from "./rich-text";

export const definitions = [
  customUrlSchema,
  richText,
  buttonSchema,
  pageBuilder,
];
