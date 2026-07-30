export interface HeroButton {
  label: string;
  url: string;
}

export interface HeroBlockMeta {
  /** Separate from link.imageUrl, which this block uses as the cover photo. */
  avatarUrl?: string;
  description?: string;
  buttons?: HeroButton[];
}
