import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { resumeText, jobDescription, targetRole } = req.body || {};
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resume text and job description are required.' });
    }

    const ai = getGeminiClient();
    const prompt = `
You are an advanced Applicant Tracking System (ATS) parser and recruiting algorithm analyst. Compare the candidate's resume against the target job description for the role "${targetRole || 'Target Role'}".

Resume Text:
${resumeText}

Job Description:
${jobDescription}

Perform ATS keyword matching, hard/soft skill extraction, and structural audit. Return a JSON object matching this schema:
- matchScore: integer between 0 and 100 representing ATS match percentage
- matchLevel: "High" | "Medium" | "Low"
- summary: concise summary of ATS compatibility (3 sentences)
- matchedHardSkills: array of hard skills/technologies present in both resume and job description
- missingHardSkills: array of critical hard skills required in job description but missing/weak in resume
- matchedSoftSkills: array of soft skills matched
- missingSoftSkills: array of soft skills mentioned in job description but missing in resume
- keywordDensityNotes: insights on keyword frequency, title alignment, and terminology matching
- atsFormattingCheck: array of objects with keys: item (e.g. "Header & Contact Info", "Standard Section Titles", "Font & Special Characters", "Table/Column Usage", "File Format/Parseability"), status ("pass" | "warning" | "fail"), note (string explaining status)
- actionableOptimizations: array of 4-6 step-by-step instructions to boost the ATS match score to 90%+
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            matchedHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchedSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordDensityNotes: { type: Type.STRING },
            atsFormattingCheck: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  status: { type: Type.STRING },
                  note: { type: Type.STRING }
                },
                required: ['item', 'status', 'note']
              }
            },
            actionableOptimizations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['matchScore', 'matchLevel', 'summary', 'matchedHardSkills', 'missingHardSkills', 'matchedSoftSkills', 'missingSoftSkills', 'keywordDensityNotes', 'atsFormattingCheck', 'actionableOptimizations']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('ATS check error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error processing ATS check.' });
  }
}
