import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetGoal, interests, techStack, difficulty, resumeText } = req.body || {};
    if (!targetGoal) {
      return res.status(400).json({ error: 'Target goal/role is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `
You are a senior tech lead and portfolio mentor recommending impactful portfolio projects for a developer or specialist aiming for the role: "${targetGoal}".
Preferred Tech Stack / Interests: ${techStack || interests || 'Modern Full Stack JavaScript / Web / AI'}
Target Difficulty: ${difficulty || 'Intermediate'}
${resumeText ? `Candidate Resume Background:\n${resumeText.slice(0, 3000)}\nTailor recommendations to fill concrete skill or project gaps missing in the candidate's resume.` : ''}

Recommend 3 standout, production-grade portfolio project ideas that recruiters and hiring managers love to see. Return JSON matching schema:
- projects: array of 3 objects with keys:
  - id: unique string id
  - title: project title
  - tagline: punchy 1-sentence description
  - difficulty: "Beginner" | "Intermediate" | "Advanced"
  - estimatedHours: string (e.g., "25-30 hours")
  - techStack: array of technologies (e.g. ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind"])
  - problemStatement: problem this project solves
  - keyFeatures: array of 4-5 core features
  - architectureOverview: brief technical architecture and API design notes
  - portfolioPresentationTips: how to showcase this project on GitHub / live demo
  - resumeBulletPoints: array of 2 strong resume bullet points candidate can write after building this project
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedHours: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  problemStatement: { type: Type.STRING },
                  keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                  architectureOverview: { type: Type.STRING },
                  portfolioPresentationTips: { type: Type.STRING },
                  resumeBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['id', 'title', 'tagline', 'difficulty', 'estimatedHours', 'techStack', 'problemStatement', 'keyFeatures', 'architectureOverview', 'portfolioPresentationTips', 'resumeBulletPoints']
              }
            }
          },
          required: ['projects']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Project suggestion error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error generating project suggestions.' });
  }
}
