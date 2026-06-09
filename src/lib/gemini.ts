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

export async function analyzeProposalText(text: string): Promise<ParsedProposal> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
    Analyze the following vendor proposal text and extract the key information.
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
    
    Proposal Text:
    ---
    ${text}
    ---
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  return parseGeminiResponse(response);
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
    throw new Error('Failed to parse proposal data.');
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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

  const result = await model.generateContent([prompt, filePart]);
  const response = result.response.text();
  
  return parseGeminiResponse(response);
}
