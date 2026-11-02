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
 * to the YouTube Data API when a key is configured, then to the
 * <meta name="title"> on the watch page (which YouTube tends to block from
 * datacenter IPs). Returns null when nothing works (private or deleted video).
 */
export async function fetchYoutubeTitle(videoId: string, apiKey?: string): Promise<string | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`);
    if (res.ok) {
      const data = (await res.json()) as { title?: string };
      if (data.title?.trim()) return data.title.trim();
    }
  } catch {
    // fall through to the Data API
  }

  if (apiKey) {
    try {
      const params = new URLSearchParams({ part: 'snippet', id: videoId, key: apiKey, hl: 'ko' });
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
      if (res.ok) {
        const data = (await res.json()) as {
          items?: { snippet?: { title?: string; localized?: { title?: string } } }[];
        };
        const snippet = data.items?.[0]?.snippet;
        const title = (snippet?.localized?.title || snippet?.title || '').trim();
        if (title) return title;
        // No item means the video is private or gone; the watch page won't help.
        if (data.items && data.items.length === 0) return null;
      } else {
        console.error('YouTube Data API error:', res.status, await res.text().catch(() => ''));
      }
    } catch (err: any) {
      console.error('YouTube Data API error:', err?.message ?? err);
    }
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
