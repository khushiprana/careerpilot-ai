import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { getGeminiClient, generateContentWithFallback } from './_lib/gemini.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('resume'));
    const file = (req as any).file;

    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No resume PDF file uploaded.' });
    }

    let text = '';
    let pageCount = 1;

    // Attempt 1: Gemini Multimodal PDF Extraction (Native, works in all environments)
    try {
      console.log('[PDF Extractor] Extracting text via Gemini AI...');
      const ai = getGeminiClient();
      const response = await generateContentWithFallback(ai, {
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: file.buffer.toString('base64')
            }
          },
          `You are an expert ATS resume parser. Extract and return ALL text content from this resume PDF document verbatim and completely.

Instructions:
1. Include all contact information, summary/objective, work experience, education, technical/soft skills, projects, and certifications.
2. Output ONLY the raw extracted resume text. Do NOT include any conversational preamble, commentary, or markdown wrapping.`
        ]
      });

      const geminiText = response.text ? response.text.trim() : '';
      if (geminiText && geminiText.length >= 10) {
        text = geminiText;
      }
    } catch (geminiErr: any) {
      console.warn('[PDF Extractor] Gemini extraction warning:', geminiErr?.message || geminiErr);
    }

    // Attempt 2: Dynamic import of pdf-parse as secondary fallback
    if (!text || text.length < 10) {
      try {
        console.log('[PDF Extractor] Attempting local pdf-parse fallback...');
        const pdfParseModule = await import('pdf-parse');
        const parseFunc: any = (pdfParseModule as any).default || (pdfParseModule as any).pdfParse || pdfParseModule;
        if (typeof parseFunc === 'function') {
          const pdfData = await parseFunc(file.buffer);
          text = pdfData.text ? pdfData.text.trim() : '';
          pageCount = pdfData.numpages || 1;
        }
      } catch (parseErr: any) {
        console.warn('[PDF Extractor] pdf-parse dynamic import error:', parseErr?.message || parseErr);
      }
    }

    if (!text || text.length < 10) {
      return res.status(400).json({
        error: 'Could not extract readable text from this PDF file. The PDF might be encrypted or empty. You can copy and paste your resume text directly into the Text Editor tab.'
      });
    }

    return res.status(200).json({
      success: true,
      text,
      fileName: file.originalname || 'uploaded_resume.pdf',
      pageCount: pageCount || 1
    });
  } catch (err: any) {
    console.error('PDF parsing server error:', err);
    return res.status(500).json({
      error: 'Failed to process PDF document: ' + (err?.message || 'Unknown error')
    });
  }
}
