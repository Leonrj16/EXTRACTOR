export interface CustomHtmlBlockMeta {
  html?: string;
  /** Fixed height in pixels — the iframe can't self-report its content
   * height without running JS inside it, which the sandbox intentionally
   * blocks (see preview.tsx), so the user sets this instead. */
  height?: number;
}
