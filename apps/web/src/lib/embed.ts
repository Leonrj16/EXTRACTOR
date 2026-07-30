export function toVideoEmbedUrl(url: string, options?: { autoplay?: boolean }): string | null {
  const autoplay = options?.autoplay ?? false;
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}${autoplay ? "?autoplay=1&mute=1" : ""}`;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}${autoplay ? "?autoplay=1&mute=1" : ""}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}${autoplay ? "?autoplay=1&muted=1" : ""}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** True when a URL points directly at a video file Aura can play natively,
 * rather than a YouTube/Vimeo page that needs an iframe embed. */
export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function toMusicEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("open.spotify.com")) {
      return `https://open.spotify.com/embed${parsed.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}
