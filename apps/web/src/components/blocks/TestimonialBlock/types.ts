export interface TestimonialBlockMeta {
  authorName?: string;
  authorRole?: string;
  rating?: number; // 1-5
  // Quote lives on link.title, avatar on link.imageUrl — reusing the
  // common fields instead of duplicating them in metadata.
}
