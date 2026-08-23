import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

function geminiApiPlugin() {
  return {
    name: 'gemini-api-server',
    configureServer(server: any) {
      server.middlewares.use('/api/generate-tags', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { description, categoryName, contentType } = JSON.parse(body || '{}');
            if (!description || !description.trim()) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ tags: [] }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ tags: [] }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey: apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const prompt = `사용자가 개인 아카이빙 앱에 항목을 저장하려고 합니다.
콘텐츠 유형: ${contentType || '텍스트'}
카테고리: ${categoryName || '일반'}
사용자가 입력한 설명 문장: "${description}"

지시사항:
- 문장의 표면적인 단어뿐만 아니라 맥락, 함축된 의도, 실질적인 주제(예: '직장에서 탁월한 사람의 특징 3가지' -> ['역량', '일잘러', '직장생활', '커리어', '인사이트'])를 깊이 있게 분석하세요.
- 검색과 카테고리화에 가장 적합한 실용적이고 직관적인 한국어 해시태그 3~5개를 생성하세요.
- 각 태그는 '#' 기호 없이 단어/명사 형태로만 JSON 배열로 반환하세요.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents: prompt,
              config: {
                systemInstruction:
                  '당신은 스마트 아카이빙 시스템의 AI 태그 분석 전문가입니다. 주어진 설명 문장의 맥락과 뉘앙스를 파악하여 최적의 해시태그 목록(문자열 배열)을 JSON으로 반환합니다.',
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
                temperature: 0.3,
              },
            });

            const text = response.text || '[]';
            const tags = JSON.parse(text);
            const cleanTags = Array.isArray(tags)
              ? tags.map((t: string) => String(t).replace(/^#/, '').trim()).filter(Boolean)
              : [];

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ tags: cleanTags }));
          } catch (err: any) {
            console.error('Gemini tag generation error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to generate tags' }));
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
