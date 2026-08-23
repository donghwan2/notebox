import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { generateTags } from './lib/generateTags';

dotenv.config();

/**
 * Serves /api/generate-tags during `vite dev`, matching the Vercel function in
 * api/generate-tags.ts so both environments behave the same.
 */
function geminiApiPlugin() {
  return {
    name: 'gemini-api-server',
    configureServer(server: any) {
      server.middlewares.use('/api/generate-tags', async (req: any, res: any) => {
        const send = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        };

        if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { description, categoryName, contentType } = JSON.parse(body || '{}');
            if (!description?.trim()) return send(200, { tags: [] });

            const tags = await generateTags(
              { description, categoryName, contentType },
              process.env.GEMINI_API_KEY
            );
            send(200, { tags });
          } catch (err: any) {
            // The client falls back to local keyword extraction, so fail soft.
            console.error('Gemini tag generation error:', err?.message ?? err);
            send(200, { tags: [], error: 'tag_generation_failed' });
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
