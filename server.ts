import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/api/generate-tags', async (req, res) => {
  try {
    const { description, categoryName, contentType } = req.body;
    if (!description || !description.trim()) {
      return res.json({ tags: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ tags: [] });
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

[작업 목표]
설명 문장의 핵심 키워드, 고유명사, 사건/액션, 뉘앙스, 밈(Vibe), 연관 검색어를 분석하여 가장 적절하고 센스 있는 해시태그 목록(2~5개)을 생성하세요.

[모범 예시 참고 (Few-Shot)]
- 입력: "AI PPT 생성, 장PM"
  -> 태그: ["AI PPT", "장PM", "PPT제작", "업무효율"]
- 입력: "구글퇴사, 노암셰지어"
  -> 태그: ["구글", "구글퇴사", "노암셰지어", "AI인물"]
- 입력: "공학쇼츠 AI영상"
  -> 태그: ["공학쇼츠", "AI영상", "쇼츠제작"]
- 입력: "밈_회사에서 이메일 파일없이 보냄"
  -> 태그: ["직장인밈", "밈", "공감짤", "업무실수", "이메일", "직장생활"]

[출력 요구사항]
- 가장 핵심적이고 유용한 태그 2~5개를 JSON 배열 형식으로 반환하세요.
- 태그 앞의 '#' 기호는 제거하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 스마트 아카이빙 시스템의 AI 태그 분석 전문가입니다. 설명 문장의 맥락, 고유명사, 밈 뉘앙스를 분석하여 가장 적절한 해시태그 목록을 JSON으로 반환합니다.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['tags'],
        },
        temperature: 0.3,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    const rawTags = Array.isArray(parsed.tags) ? parsed.tags : [];
    
    // Clean tags
    const cleanTags = rawTags
      .map((t: string) => String(t).replace(/^#/, '').trim())
      .filter(Boolean);

    return res.json({
      tags: cleanTags,
    });
  } catch (err: any) {
    console.error('Gemini tag generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate tags' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
