import type { BlockDefinition } from "../types";
import {
  TESTIMONIAL_BLOCK_DEFAULT_META,
  TESTIMONIAL_BLOCK_DESCRIPTION,
  TESTIMONIAL_BLOCK_ICON,
  TESTIMONIAL_BLOCK_LABEL,
} from "./config";
import { TestimonialBlockPreview } from "./preview";
import { TestimonialBlockSettings } from "./settings";
import type { TestimonialBlockMeta } from "./types";

export const testimonialBlockDefinition: BlockDefinition<TestimonialBlockMeta> = {
  kind: "TESTIMONIAL",
  label: TESTIMONIAL_BLOCK_LABEL,
  description: TESTIMONIAL_BLOCK_DESCRIPTION,
  icon: TESTIMONIAL_BLOCK_ICON,
  defaultMeta: TESTIMONIAL_BLOCK_DEFAULT_META,
  Preview: TestimonialBlockPreview,
  Settings: TestimonialBlockSettings,
};
