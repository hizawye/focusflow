// Gemini API utility for schedule generation
import { ScheduleItem } from './types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function generateScheduleWithGemini(prompt: string): Promise<ScheduleItem[]> {
  // Try both Vite and Node envs for the API key
  let apiKey = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
  if (!apiKey) throw new Error('Gemini API key not found');

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  // Try to extract JSON from the reply
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = extractJsonFromReply(text);
  return JSON.parse(json);
}

// Helper to extract JSON array from Gemini's reply
function extractJsonFromReply(reply: string): string {
  const match = reply.match(/\[.*\]/s);
  if (match) return match[0];
  const error: any = new Error('No JSON array found in Gemini reply');
  error.rawReply = reply;
  throw error;
}
