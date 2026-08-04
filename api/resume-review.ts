import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { resumeText, targetRole, experienceLevel } = req.body || {};
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required for review.' });
    }

    const ai = getGeminiClient();
    const prompt = `
You are a top tech recruiter and career coach analyzing a resume for the target role: "${targetRole || 'General Career'}" (Experience Level: ${experienceLevel || 'Entry/Mid'}).

Resume Text:
${resumeText}

Analyze this resume thoroughly and output a structured JSON evaluation adhering to the following schema:
- overallScore: integer between 0 and 100
- summary: executive summary of the candidate profile and key impression (3-4 sentences)
- keyStrengths: array of 3-5 specific strengths found in the resume
- criticalWeaknesses: array of 3-5 areas where the resume falls short
- sectionFeedback: array of objects with keys: section (e.g. "Work Experience", "Skills", "Education", "Projects", "Formatting"), score (0-100), feedback (string), suggestions (array of 2-3 specific action items)
- bulletPointImprovements: array of 3-4 bullet points from the resume with keys: original (string), improved (strong action-verb, metrics-driven bullet rewrite), reason (why this edit makes it stronger)
- formattingAdvice: array of 3-4 tips regarding layout, density, readability, or impact.
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            sectionFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['section', 'score', 'feedback', 'suggestions']
              }
            },
            bulletPointImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['original', 'improved', 'reason']
              }
            },
            formattingAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['overallScore', 'summary', 'keyStrengths', 'criticalWeaknesses', 'sectionFeedback', 'bulletPointImprovements', 'formattingAdvice']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Resume review error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error conducting resume review.' });
  }
}
