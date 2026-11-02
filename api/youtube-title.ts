import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchYoutubeTitle, isYoutubeVideoId } from '../lib/youtubeTitle';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!isYoutubeVideoId(id)) return res.status(400).json({ error: 'invalid_video_id' });

  const title = await fetchYoutubeTitle(id);
  // Titles rarely change; let the CDN absorb repeat lookups.
  if (title) res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({ title });
}
