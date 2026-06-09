import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface ParsedProposal {
  vendor_name: string;
  category: string;
  offered_price: number;
  duration_months: number;
  risk_status: 'Low' | 'Medium' | 'High';
  risk_score: number;
  ai_summary: string;
}

const FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

async function generateWithFallback(contentPayload: any[] | string): Promise<string> {
  let lastError: Error | null = null;
  
  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`Menghubungi Gemini AI menggunakan model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(contentPayload);
      return result.response.text();
      
    } catch (error: any) {
      console.warn(`Model ${modelName} gagal:`, error.message);
      lastError = error;
      
      // Jika error 503 (High Demand), 429 (Rate Limit), atau 404 (Not Found), lanjut ke model berikutnya
      if (
        error.message.includes('503') || 
        error.message.includes('429') || 
        error.message.includes('404') ||
        error.message.includes('overloaded') ||
        error.message.includes('exhausted')
      ) {
        continue;
      }
      
      // Jika error lain (seperti API key salah), langsung throw
      throw error;
    }
  }
  
  throw new Error(`Semua model AI sedang sibuk atau tidak tersedia. Error terakhir: ${lastError?.message}`);
}

// Helper to parse JSON safely
function parseGeminiResponse(response: string): ParsedProposal {
  try {
    let cleanJson = response.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(cleanJson) as ParsedProposal;
  } catch (error) {
    console.error('Failed to parse Gemini response', error, response);
    throw new Error('Gagal memproses data JSON dari AI. Silakan coba lagi.');
  }
}

// Convert File to Base64
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export async function analyzeProposalFile(file: File): Promise<ParsedProposal> {
  const filePart = await fileToGenerativePart(file);

  const prompt = `
    Analyze the attached vendor proposal document and extract the key information.
    Format your response ONLY as a raw JSON object (without markdown code blocks, just the JSON) adhering to this schema:
    {
      "vendor_name": "Name of the vendor",
      "category": "Category of service (e.g. IT, Marketing, Construction)",
      "offered_price": numeric value (e.g. 50000),
      "duration_months": numeric value (estimated duration in months, e.g. 6),
      "risk_status": "Low", "Medium", or "High" (based on your analysis of their proposal's feasibility, timeline, and completeness),
      "risk_score": numeric value between 1 and 100 (where 1 is lowest risk and 100 is highest risk),
      "ai_summary": "A 1-2 paragraph summary of their proposal strengths, weaknesses, and potential risks."
    }
    
    If any information is missing, provide a reasonable guess or leave it as a default (e.g. 0 or "Unknown"). 
  `;

  const responseText = await generateWithFallback([prompt, filePart]);
  return parseGeminiResponse(responseText);
}

export async function compareVendorsAI(vendorDataString: string): Promise<string> {
  const prompt = `
    You are an expert procurement analyst. Compare the following vendors based on their proposals, risk scores, duration, and prices.
    Provide a concise (1-2 paragraphs) final recommendation on which vendor is the best option for the company.
    
    Vendor Data:
    ${vendorDataString}
  `;

  return await generateWithFallback(prompt);
}
