// The embedded iframe can contain its own clickable content (links, form
// controls) — like VideoBlock/ContactBlock, it skips the generic hover/tap
// scale so BlockFrame doesn't fight with interaction inside the iframe.
export const CUSTOM_HTML_BLOCK_INTERACTIVE = true;
