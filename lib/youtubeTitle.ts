const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

export function isYoutubeVideoId(id: unknown): id is string {
  return typeof id === 'string' && VIDEO_ID.test(id);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * oEmbed answers 401 for videos whose owner disabled embedding, so fall back
 * to the <meta name="title"> on the watch page. Returns null when neither works
 * (private, deleted, or YouTube blocking the request).
 */
export async function fetchYoutubeTitle(videoId: string): Promise<string | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`);
    if (res.ok) {
      const data = (await res.json()) as { title?: string };
      if (data.title?.trim()) return data.title.trim();
    }
  } catch {
    // fall through to the watch page
  }

  try {
    const res = await fetch(watchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ko,en;q=0.8' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta name="title" content="([^"]*)"/);
    const title = match ? decodeEntities(match[1]).trim() : '';
    return title || null;
  } catch {
    return null;
  }
}
