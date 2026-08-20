// No block-specific fields yet — the embed is fully derived from link.url
// via toMusicEmbedUrl(). A plain permissive type instead of an empty
// interface, since ESLint disallows empty interface declarations.
export type MusicBlockMeta = Record<string, unknown>;
