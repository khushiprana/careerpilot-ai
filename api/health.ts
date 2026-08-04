import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CareerPilot AI Server',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
}
