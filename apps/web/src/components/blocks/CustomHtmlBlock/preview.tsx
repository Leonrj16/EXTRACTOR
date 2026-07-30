"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { CUSTOM_HTML_BLOCK_DEFAULT_META } from "./config";
import { CUSTOM_HTML_BLOCK_INTERACTIVE } from "./animation";
import { CUSTOM_HTML_IFRAME_CLASS, CUSTOM_HTML_WRAPPER_CLASS } from "./styles";
import type { CustomHtmlBlockMeta } from "./types";

export function CustomHtmlBlockPreview({ meta, styleOverrides, theme, index }: BlockPreviewProps<CustomHtmlBlockMeta>) {
  const resolved = { ...CUSTOM_HTML_BLOCK_DEFAULT_META, ...meta };

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const content = (
    <div className={`${CUSTOM_HTML_WRAPPER_CLASS} ${theme.cardRadius}`} style={style}>
      {resolved.html ? (
        // No "allow-scripts" — this is the whole point of this block: it
        // renders arbitrary user-supplied HTML/CSS without ever executing
        // JavaScript, so it can't be an XSS vector. "allow-same-origin"
        // alone (no scripts) is safe: nothing runs that could act on that
        // origin access.
        <iframe
          title="HTML personalizado"
          srcDoc={resolved.html}
          sandbox="allow-same-origin"
          className={CUSTOM_HTML_IFRAME_CLASS}
          style={{ height: resolved.height ?? 200 }}
        />
      ) : (
        <div className="flex items-center justify-center p-8 text-xs opacity-50">Sin contenido HTML todavía</div>
      )}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={CUSTOM_HTML_BLOCK_INTERACTIVE} index={index}>
      {content}
    </BlockFrame>
  );
}
