// The embedded map iframe already has its own internal interaction (pan/
// zoom), so the block opts out of the shared hover/tap scale to avoid
// fighting the iframe's own gestures.
export const MAP_BLOCK_INTERACTIVE = true;
