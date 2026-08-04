import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

export function isTransientOrDemandError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || err.statusCode || err.code;

  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('capacity') ||
    msg.includes('unavailable') ||
    msg.includes('temporarily') ||
    msg.includes('busy')
  );
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateContentWithFallback(
  ai: GoogleGenAI,
  requestConfig: {
    contents: any;
    config?: any;
  },
  modelsToTry: string[] = FALLBACK_MODELS
): Promise<any> {
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini Call] Requesting model: ${model} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model,
          ...requestConfig
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Warning] Model ${model} attempt ${attempt + 1} failed: ${err?.message || err}`);

        if (isTransientOrDemandError(err)) {
          if (attempt === 0) {
            await delay(600 + Math.random() * 400);
            continue;
          }
        } else {
          break;
        }
      }
    }
    console.warn(`[Gemini Fallback] High demand spike or error on ${model}. Falling back to next available model...`);
  }

  if (isTransientOrDemandError(lastError)) {
    throw new Error('AI services are currently experiencing an unusually high demand spike. Please wait a few moments and try again.');
  }
  throw lastError || new Error('All AI model attempts failed.');
}

export async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  requestConfig: {
    contents: any;
    config?: any;
  },
  modelsToTry: string[] = FALLBACK_MODELS
): Promise<any> {
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini Stream Call] Requesting model: ${model} (attempt ${attempt + 1})`);
        const streamResponse = await ai.models.generateContentStream({
          model,
          ...requestConfig
        });
        return streamResponse;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Stream Warning] Model ${model} attempt ${attempt + 1} failed: ${err?.message || err}`);

        if (isTransientOrDemandError(err)) {
          if (attempt === 0) {
            await delay(600 + Math.random() * 400);
            continue;
          }
        } else {
          break;
        }
      }
    }
    console.warn(`[Gemini Stream Fallback] High demand spike or error on ${model}. Falling back to next stream model...`);
  }

  if (isTransientOrDemandError(lastError)) {
    throw new Error('AI services are currently experiencing an unusually high demand spike. Please wait a few moments and try again.');
  }
  throw lastError || new Error('All AI model stream attempts failed.');
}
