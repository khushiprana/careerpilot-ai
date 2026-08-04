import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, generateContentStreamWithFallback, isTransientOrDemandError } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, userContext } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient();

    let contextString = '';
    if (userContext) {
      if (userContext.role) contextString += `Target Role: ${userContext.role}\n`;
      if (userContext.experienceLevel) contextString += `Experience Level: ${userContext.experienceLevel}\n`;
      if (userContext.resumeText) contextString += `Resume Snippet:\n${userContext.resumeText.slice(0, 1500)}...\n`;
    }

    const systemInstruction = `
You are CareerPilot AI, an elite personal AI career coach, resume strategist, and technical interview advisor.
Your guidance is actionable, highly practical, encouraging, and structured.
${contextString ? `Current User Context:\n${contextString}` : ''}

CRITICAL FORMATTING INSTRUCTIONS FOR CHAT RESPONSES:
- Structure your answer cleanly with Markdown headings (e.g., ### Key Strategy, ### Action Steps).
- Use bullet points (- ) or numbered lists (1. ) for step-by-step points so answers are concise and easily scannable.
- Use bold text for key terms, metrics, and actionable advice.
- When suggesting resume bullet points, cover letter lines, or code examples, format them inside markdown code blocks or callouts for readability.
- Keep responses focused, well-organized, and clear. Avoid wall-of-text paragraphs.
`;

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const lastUserMessage = messages[messages.length - 1].text;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const streamResponse = await generateContentStreamWithFallback(ai, {
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastUserMessage }] }
      ],
      config: {
        systemInstruction
      }
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      const statusCode = isTransientOrDemandError(err) ? 429 : 500;
      return res.status(statusCode).json({ error: err.message || 'Error processing chat response.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
}
