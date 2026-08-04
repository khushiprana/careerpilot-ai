import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetGoal, currentLevel, weeklyHours, timeframeWeeks, resumeText } = req.body || {};
    if (!targetGoal) {
      return res.status(400).json({ error: 'Target goal/role is required.' });
    }

    const hours = weeklyHours || 10;
    const weeksCount = timeframeWeeks || 4;
    const level = currentLevel || 'Beginner';

    const ai = getGeminiClient();
    const prompt = `
You are an expert career mentor and curriculum engineer creating a customized step-by-step learning roadmap for someone targeting the role: "${targetGoal}".
Current Skill Level: ${level}
Available Study Time: ${hours} hours/week
Target Timeframe: ${weeksCount} weeks
${resumeText ? `Candidate Resume Background:\n${resumeText.slice(0, 3000)}\nTailor this roadmap specifically to bridge any gap between candidate's current resume background and the target goal.` : ''}

Create a structured, weekly breakdown. Return a JSON object conforming to:
- role: string
- level: string
- totalWeeks: integer (${weeksCount})
- overview: clear strategy overview (2-3 sentences)
- weeks: array of ${weeksCount} objects, each with keys:
  - weekNumber: integer
  - title: week theme / topic focus
  - goal: specific objective for the week
  - topics: array of 3-4 subtopics to master
  - dailyTasks: array of 4-5 concrete daily learning actions
  - recommendedResources: array of 2-3 objects with keys: title (string), type ("Documentation" | "Course" | "Tutorial" | "Practice"), url (realistic official docs/resource search query or link)
  - milestoneProject: a mini-project or deliverable for the week to prove mastery
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            level: { type: Type.STRING },
            totalWeeks: { type: Type.INTEGER },
            overview: { type: Type.STRING },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  goal: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dailyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedResources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ['title', 'type', 'url']
                    }
                  },
                  milestoneProject: { type: Type.STRING }
                },
                required: ['weekNumber', 'title', 'goal', 'topics', 'dailyTasks', 'recommendedResources', 'milestoneProject']
              }
            }
          },
          required: ['role', 'level', 'totalWeeks', 'overview', 'weeks']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Roadmap error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error creating learning roadmap.' });
  }
}
