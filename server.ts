import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateTags } from './lib/generateTags';
import { fetchYoutubeTitle, isYoutubeVideoId } from './lib/youtubeTitle';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/api/generate-tags', async (req, res) => {
  try {
    const { description, categoryName, contentType } = req.body ?? {};
    if (!description?.trim()) return res.json({ tags: [] });

    const tags = await generateTags(
      { description, categoryName, contentType },
      process.env.GEMINI_API_KEY
    );
    return res.json({ tags });
  } catch (err: any) {
    // The client falls back to local keyword extraction, so fail soft.
    console.error('Gemini tag generation error:', err?.message ?? err);
    return res.json({ tags: [], error: 'tag_generation_failed' });
  }
});

app.get('/api/youtube-title', async (req, res) => {
  const { id } = req.query;
  if (!isYoutubeVideoId(id)) return res.status(400).json({ error: 'invalid_video_id' });
  return res.json({ title: await fetchYoutubeTitle(id, process.env.YOUTUBE_API_KEY) });
});

// Serve static assets in production
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
