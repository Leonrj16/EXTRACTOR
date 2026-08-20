// The embedded Spotify player has its own internal controls (play/pause,
// seek), so the block opts out of the shared hover/tap scale to avoid
// fighting the iframe's own interaction.
export const MUSIC_BLOCK_INTERACTIVE = true;
