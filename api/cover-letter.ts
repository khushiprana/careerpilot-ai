import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { resumeText, jobDescription, targetRole, companyName, tone, focusAreas } = req.body || {};
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description are required to generate cover letter.' });
    }

    const ai = getGeminiClient();
    const prompt = `
You are a professional executive career writer. Write a customized, compelling, and highly targeted cover letter.

Target Role: ${targetRole || 'Target Role'}
Company Name: ${companyName || 'Target Company'}
Desired Tone: ${tone || 'Professional & Confident'}
Focus Areas: ${focusAreas || 'Key achievements, technical skills, and cultural fit'}

Resume Context:
${resumeText}

Job Description Context:
${jobDescription}

Generate a polished cover letter in plain text formatted with standard business letter structure. Return a JSON object with schema:
- applicantName: extracted or inferred candidate name (or "Candidate Name" if absent)
- targetCompany: string
- targetRole: string
- coverLetterText: complete text of the cover letter formatted with paragraphs
- keyHighlights: array of 3 bullet points highlighting why this cover letter stands out
- tipsForCustomization: array of 3 actionable tips for candidate before sending
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicantName: { type: Type.STRING },
            targetCompany: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            coverLetterText: { type: Type.STRING },
            keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            tipsForCustomization: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['applicantName', 'targetCompany', 'targetRole', 'coverLetterText', 'keyHighlights', 'tipsForCustomization']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Cover letter error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error generating cover letter.' });
  }
}
