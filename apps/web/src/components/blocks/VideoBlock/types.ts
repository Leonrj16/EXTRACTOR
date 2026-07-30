export interface VideoBlockMeta {
  /** "auto" resolves YouTube/Vimeo via toVideoEmbedUrl; "mp4" plays the URL directly with <video>. */
  source?: "auto" | "mp4";
  autoplay?: boolean;
  // Thumbnail reuses LinkItem.imageUrl (top-level, shared by every block
  // that needs an image) instead of a second field with the same purpose.
}
