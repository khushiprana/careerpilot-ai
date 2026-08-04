import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { getGeminiClient, generateContentWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetRole, interviewType, action, questionToEvaluate, userAnswer, resumeText } = req.body || {};

    const ai = getGeminiClient();

    if (action === 'evaluate_answer') {
      if (!questionToEvaluate || !userAnswer) {
        return res.status(400).json({ error: 'Question and user answer are required for evaluation.' });
      }

      const evalPrompt = `
You are a senior hiring manager conducting an interview evaluation for the role "${targetRole || 'Software Engineer'}".
${resumeText ? `Candidate Resume Context:\n${resumeText.slice(0, 2500)}\n` : ''}

Question Asked:
${questionToEvaluate}

Candidate's Answer:
${userAnswer}

Evaluate the candidate's answer using the STAR method (Situation, Task, Action, Result) and communication clarity. Return JSON matching:
- score: integer between 0 and 100
- feedback: general constructive feedback summary
- strengths: array of 2-3 things done well
- areasToImprove: array of 2-3 specific improvements
- modelAnswerSuggestion: an exemplary rewrite of how to answer this question brilliantly
`;

      const evalResp = await generateContentWithFallback(ai, {
        contents: evalPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
              modelAnswerSuggestion: { type: Type.STRING }
            },
            required: ['score', 'feedback', 'strengths', 'areasToImprove', 'modelAnswerSuggestion']
          }
        }
      });

      return res.status(200).json(JSON.parse(evalResp.text || '{}'));
    }

    // Default action: Generate Interview Questions
    const prompt = `
You are an expert technical and HR interviewer preparing a candidate for a role as "${targetRole || 'Full Stack Developer'}".
Interview Category: ${interviewType || 'Behavioral and Technical'}
${resumeText ? `Candidate Resume Background:\n${resumeText.slice(0, 3000)}\nTailor questions and STAR guides to reflect candidate's specific background and experience level in their resume.` : ''}

Generate 5 high-yield interview questions for this specific role and interview type. For each question, provide a STAR guide, sample answer, and key competencies. Return JSON adhering to:
- questions: array of 5 objects with keys:
  - id: unique string id
  - category: "HR" | "Technical" | "Behavioral" | "System Design"
  - difficulty: "Easy" | "Medium" | "Hard"
  - question: string
  - contextWhyAsked: string explaining what the interviewer is secretly testing for
  - starGuide: object with situation, task, action, result strings
  - sampleAnswer: candidate's strong sample response
  - keyKeywordsToInclude: array of technical/domain terms to weave into answer
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  question: { type: Type.STRING },
                  contextWhyAsked: { type: Type.STRING },
                  starGuide: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING }
                    },
                    required: ['situation', 'task', 'action', 'result']
                  },
                  sampleAnswer: { type: Type.STRING },
                  keyKeywordsToInclude: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['id', 'category', 'difficulty', 'question', 'contextWhyAsked', 'starGuide', 'sampleAnswer', 'keyKeywordsToInclude']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Interview error:', err);
    const statusCode = isTransientOrDemandError(err) ? 429 : 500;
    return res.status(statusCode).json({ error: err.message || 'Error generating interview questions.' });
  }
}
