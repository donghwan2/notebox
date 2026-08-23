import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateTags } from '../lib/generateTags';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, categoryName, contentType } = (req.body ?? {}) as {
      description?: string;
      categoryName?: string;
      contentType?: string;
    };

    if (!description?.trim()) return res.status(200).json({ tags: [] });

    const tags = await generateTags(
      { description, categoryName, contentType },
      process.env.GEMINI_API_KEY
    );

    return res.status(200).json({ tags });
  } catch (err: any) {
    // The client falls back to local keyword extraction, so fail soft.
    console.error('Gemini tag generation error:', err?.message ?? err);
    return res.status(200).json({ tags: [], error: 'tag_generation_failed' });
  }
}
