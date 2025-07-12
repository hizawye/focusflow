// Gemini API utility for schedule generation
import { ScheduleItem } from './types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// System prompt for better, faster responses
const SYSTEM_PROMPT = `You are "FocusFlow AI", a concise productivity assistant.

YOUR SOLE OUTPUT MUST BE **ONE** valid JSON array (UTF-8 text) – no markdown, no comments, no additional keys.  If you are unsure, output an empty JSON array [].

SUPPORTED TASK SHAPES (only these keys allowed):
1. FIXED  → {"title","start","end"}
2. FLEXIBLE → {"title","isFlexible":true,"duration", "preferredTimeSlots" (array of "morning"|"afternoon"|"evening"), "earliestStart","latestEnd"}
3. TIMELESS → {"title","isTimeless":true}

CONSTRAINTS:
• Times in 24h HH:MM (zero-padded).  Start < End.
• duration is minutes (integer 15 – 240).
• Title < 38 characters, action-oriented verb.
• NO overlapping times when multiple FIXED tasks are requested in same call.
• Prefer user’s chrono-logic: morning slots before 12:00, afternoon 12-17, evening 17-22.
• If user gives specific words like "flexible" or "anytime" → choose FLEXIBLE.
• If user gives an exact time or range → choose FIXED.
• Otherwise default to TIMELESS.

EXAMPLES:
Input: "Study math from 9-10"
Output: [{"title":"Study Mathematics","start":"09:00","end":"10:00"}]

Input: "1h workout"
Output: [{"title":"Workout","isFlexible":true,"duration":60,"preferredTimeSlots":["morning"],"earliestStart":"06:00","latestEnd":"20:00"}]

Input: "Call mom"
Output: [{"title":"Call Mom","isTimeless":true}]

Respond quickly and follow the JSON schema exactly.`;

// Generate multiple schedule items for a full daily schedule
export async function generateDailyScheduleWithGemini(userPrompt: string): Promise<ScheduleItem[]> {
  // Try both Vite and Node envs for the API key
  let apiKey = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
  if (!apiKey) throw new Error('Gemini API key not found');

  const dailySchedulePrompt = `You are a productivity assistant that creates full daily schedules with flexible scheduling support.

CRITICAL RULES:
1. ALWAYS return ONLY valid JSON array format - no explanations, no markdown, no extra text
2. Create a realistic daily schedule with 5-10 items
3. Use 24-hour format for times (HH:MM) when applicable
4. Support three types of tasks:
   - FIXED: specific start/end times like "09:00" to "10:30"
   - FLEXIBLE: duration-based tasks that can be scheduled anytime (e.g., "1 hour workout")
   - TIMELESS: tasks without specific times or duration (e.g., "write report", "call mom")
5. Include breaks, meals, and buffer time between tasks
6. Make start/end times logical and non-overlapping for fixed tasks
7. Consider typical daily patterns (morning routine, work blocks, lunch, afternoon work, evening)

RESPONSE FORMAT for MIXED schedule:
[
  {"title": "Morning Routine", "start": "07:00", "end": "08:00"},
  {"title": "1h Deep Work", "isFlexible": true, "duration": 60, "preferredTimeSlots": ["morning"], "earliestStart": "08:00", "latestEnd": "12:00"},
  {"title": "Break", "start": "10:30", "end": "10:45"},
  {"title": "30min Exercise", "isFlexible": true, "duration": 30, "preferredTimeSlots": ["afternoon"], "earliestStart": "14:00", "latestEnd": "18:00"},
  {"title": "Call Mom", "isTimeless": true}
]

Be fast and direct. No explanations needed.

USER REQUEST: "${userPrompt}"

RESPONSE:`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: dailySchedulePrompt }] }],
      generationConfig: {
        temperature: 0.2, // Slightly higher for more variety in daily schedules
        maxOutputTokens: 2000, // More tokens for multiple items
        candidateCount: 1,
      },
    }),
  });
  
  const data = await res.json();
  
  // Enhanced error handling
  if (!res.ok) {
    throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  // Try to extract JSON from the reply
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = extractJsonFromReply(text);
  return JSON.parse(json);
}

export async function generateScheduleWithGemini(userPrompt: string): Promise<ScheduleItem[]> {
  // Try both Vite and Node envs for the API key
  let apiKey = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
  if (!apiKey) throw new Error('Gemini API key not found');

  // Construct optimized prompt with system instructions
  const optimizedPrompt = `${SYSTEM_PROMPT}

USER REQUEST: "${userPrompt}"

RESPONSE:`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: optimizedPrompt }] }],
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent responses
        maxOutputTokens: 1000, // Limit output to prevent unnecessary text
        candidateCount: 1,
      },
    }),
  });
  
  const data = await res.json();
  
  // Enhanced error handling
  if (!res.ok) {
    throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  // Try to extract JSON from the reply
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = extractJsonFromReply(text);
  return sanitizeTasks(JSON.parse(json));
}

// Generate schedule items with context awareness of existing schedule
export async function generateScheduleWithContext(
  userPrompt: string, 
  existingItems: ScheduleItem[]
): Promise<ScheduleItem[]> {
  // Try both Vite and Node envs for the API key
  let apiKey = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
  if (!apiKey) throw new Error('Gemini API key not found');

  // Create context from existing items
  const existingScheduleContext = existingItems.length > 0 
    ? `EXISTING SCHEDULE ITEMS (avoid conflicts with these times):
${existingItems.map(item => {
  if (item.isTimeless) {
    return `- ${item.title}: (timeless task)`;
  } else if (item.isFlexible) {
    return `- ${item.title}: (flexible task, ${item.duration}min)`;
  } else if (item.start && item.end) {
    return `- ${item.title}: ${item.start} - ${item.end}`;
  } else {
    return `- ${item.title}: (no time specified)`;
  }
}).join('\n')}

AVAILABLE TIME SLOTS: Find gaps between existing items or suggest times that don't conflict.`
    : 'No existing schedule items - you can suggest any reasonable times.';

  const contextAwarePrompt = `You are a productivity assistant that creates schedule items while considering existing commitments and supporting flexible scheduling.

CRITICAL RULES:
1. ALWAYS return ONLY valid JSON array format - no explanations, no markdown, no extra text
2. Support three types of tasks:
   - FIXED: specific start/end times like "09:00" to "10:30"
   - FLEXIBLE: duration-based tasks that can be scheduled anytime (e.g., "1 hour workout")
   - TIMELESS: tasks without specific times or duration (e.g., "write report", "call mom")
3. Use 24-hour format for times (HH:MM) when applicable
4. AVOID TIME CONFLICTS with existing fixed schedule items
5. For flexible tasks, consider available time slots that don't conflict with fixed commitments
6. Consider logical scheduling (don't put intensive work right after meals, etc.)

${existingScheduleContext}

RESPONSE FORMAT for FIXED tasks:
[{"title": "Task Name", "start": "HH:MM", "end": "HH:MM"}]

RESPONSE FORMAT for FLEXIBLE tasks:
[{"title": "Task Name", "isFlexible": true, "duration": 60, "preferredTimeSlots": ["morning"], "earliestStart": "07:00", "latestEnd": "22:00"}]

RESPONSE FORMAT for TIMELESS tasks:
[{"title": "Task Name", "isTimeless": true}]

TASK TYPE DETECTION:
- If user specifies exact times → FIXED task
- If user mentions duration (1h, 30min, 2 hours) → FLEXIBLE task  
- If user mentions just an action without time → TIMELESS task

Be fast and direct. No explanations needed.

USER REQUEST: "${userPrompt}"

RESPONSE:`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: contextAwarePrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        candidateCount: 1,
      },
    }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = extractJsonFromReply(text);
  return JSON.parse(json);
}

// Generate flexible tasks with smart time suggestions
export async function generateFlexibleScheduleWithGemini(
  userPrompt: string,
  existingTasks: ScheduleItem[] = []
): Promise<ScheduleItem[]> {
  // Try both Vite and Node envs for the API key
  let apiKey = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
  if (!apiKey) throw new Error('Gemini API key not found');

  const flexiblePrompt = `You are a productivity assistant that creates flexible schedule items.

CRITICAL RULES:
1. ALWAYS return ONLY valid JSON array format - no explanations, no markdown, no extra text
2. Focus on creating FLEXIBLE or TIMELESS tasks that can be scheduled anytime
3. Analyze the user request to determine if they want fixed times, flexible duration, or timeless tasks
4. For flexible tasks, provide duration and preferred time slots
5. For timeless tasks, don't include any time-related properties

RESPONSE FORMAT for FLEXIBLE tasks (preferred):
[{"title": "Task Name", "isFlexible": true, "duration": 60, "preferredTimeSlots": ["morning"], "earliestStart": "07:00", "latestEnd": "22:00"}]

RESPONSE FORMAT for TIMELESS tasks:
[{"title": "Task Name", "isTimeless": true}]

RESPONSE FORMAT for FIXED tasks (only if user specifies exact times):
[{"title": "Task Name", "start": "HH:MM", "end": "HH:MM"}]

FLEXIBLE TASK EXAMPLES:
- "1 hour workout" → [{"title": "Workout Session", "isFlexible": true, "duration": 60, "preferredTimeSlots": ["morning"], "earliestStart": "06:00", "latestEnd": "21:00"}]
- "30 min reading" → [{"title": "Reading Time", "isFlexible": true, "duration": 30, "preferredTimeSlots": ["evening"], "earliestStart": "18:00", "latestEnd": "23:00"}]
- "2 hours coding" → [{"title": "Coding Session", "isFlexible": true, "duration": 120, "preferredTimeSlots": ["morning", "afternoon"], "earliestStart": "08:00", "latestEnd": "18:00"}]

TIMELESS TASK EXAMPLES:
- "call mom" → [{"title": "Call Mom", "isTimeless": true}]
- "write report" → [{"title": "Write Report", "isTimeless": true}]
- "buy groceries" → [{"title": "Buy Groceries", "isTimeless": true}]

Be fast and direct. No explanations needed.

USER REQUEST: "${userPrompt}"

RESPONSE:`;

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: flexiblePrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        candidateCount: 1,
      },
    }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = extractJsonFromReply(text);
  const tasks = JSON.parse(json);

  // For flexible tasks, suggest actual start/end times
  return tasks.map((task: ScheduleItem) => {
    if (task.isFlexible && !task.isTimeless) {
      const suggestedTimes = suggestFlexibleTaskTimes(task, existingTasks);
      return {
        ...task,
        // Keep original start/end as undefined for flexible tasks but add suggested times as metadata
        suggestedStart: suggestedTimes.start,
        suggestedEnd: suggestedTimes.end
      };
    }
    return task;
  });
}

// Utility function to suggest actual start/end times for flexible tasks
export function suggestFlexibleTaskTimes(
  flexibleTask: ScheduleItem,
  existingFixedTasks: ScheduleItem[]
): { start: string; end: string } {
  if (!flexibleTask.isFlexible || !flexibleTask.duration) {
    return { 
      start: flexibleTask.start || "09:00", 
      end: flexibleTask.end || "10:00" 
    };
  }

  const duration = flexibleTask.duration;
  const earliestStart = flexibleTask.earliestStart || "06:00";
  const latestEnd = flexibleTask.latestEnd || "23:00";
  const preferredSlots = flexibleTask.preferredTimeSlots || ["anytime"];

  // Convert time strings to minutes for easier calculation
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(earliestStart);
  const endMinutes = timeToMinutes(latestEnd);

  // Get occupied time slots from fixed tasks (only those with actual start/end times)
  const occupiedSlots = existingFixedTasks
    .filter(task => !task.isFlexible && !task.isTimeless && task.start && task.end)
    .map(task => ({
      start: timeToMinutes(task.start!),
      end: timeToMinutes(task.end!)
    }))
    .sort((a, b) => a.start - b.start);

  // Find available time slots
  const findAvailableSlot = (preferredStart: number, preferredEnd: number): { start: string; end: string } | null => {
    for (let currentStart = preferredStart; currentStart <= preferredEnd - duration; currentStart += 15) {
      const currentEnd = currentStart + duration;
      
      // Check if this slot conflicts with any occupied slot
      const hasConflict = occupiedSlots.some(slot => 
        (currentStart < slot.end && currentEnd > slot.start)
      );

      if (!hasConflict && currentEnd <= preferredEnd) {
        return {
          start: minutesToTime(currentStart),
          end: minutesToTime(currentEnd)
        };
      }
    }
    return null;
  };

  // Try to find slot based on preferred time slots
  for (const slot of preferredSlots) {
    let slotStart = startMinutes;
    let slotEnd = endMinutes;

    switch (slot) {
      case "morning":
        slotStart = Math.max(startMinutes, timeToMinutes("06:00"));
        slotEnd = Math.min(endMinutes, timeToMinutes("12:00"));
        break;
      case "afternoon":
        slotStart = Math.max(startMinutes, timeToMinutes("12:00"));
        slotEnd = Math.min(endMinutes, timeToMinutes("18:00"));
        break;
      case "evening":
        slotStart = Math.max(startMinutes, timeToMinutes("18:00"));
        slotEnd = Math.min(endMinutes, timeToMinutes("23:00"));
        break;
      case "anytime":
      default:
        // Use full range
        break;
    }

    const result = findAvailableSlot(slotStart, slotEnd);
    if (result) {
      return result;
    }
  }

  // Fallback: suggest earliest possible time within the overall range
  return {
    start: minutesToTime(startMinutes),
    end: minutesToTime(startMinutes + duration)
  };
}

// Helper to extract JSON array from Gemini's reply
function extractJsonFromReply(reply: string): string {
  // Clean up the reply by removing markdown code blocks and extra whitespace
  const cleanReply = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Try to find JSON array in the cleaned reply
  const arrayMatch = cleanReply.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  
  // Try to find JSON object and wrap it in an array
  const objectMatch = cleanReply.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return `[${objectMatch[0]}]`;
  }
  
  // If no valid JSON found, try to extract just the first line that looks like JSON
  const lines = cleanReply.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed;
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return `[${trimmed}]`;
    }
  }
  
  // Last resort: try to parse the entire cleaned reply as JSON
  try {
    JSON.parse(cleanReply);
    return cleanReply;
  } catch {
    // If all else fails, throw an error with the raw reply for debugging
    const error: any = new Error('No valid JSON found in Gemini reply');
    error.rawReply = reply;
    error.cleanedReply = cleanReply;
    throw error;
  }
}

// Validate and sanitize raw objects coming from Gemini
function sanitizeTasks(raw: any[]): ScheduleItem[] {
  const isTime = (t: any) => typeof t === 'string' && /^\d{2}:\d{2}$/.test(t);

  const clean: ScheduleItem[] = [];
  for (const obj of raw) {
    if (!obj || typeof obj !== 'object') continue;
    const base: Partial<ScheduleItem> = {
      title: typeof obj.title === 'string' ? obj.title.slice(0, 38) : 'Untitled'
    };

    if (obj.isTimeless) {
      clean.push({ ...base, isTimeless: true } as ScheduleItem);
      continue;
    }

    if (obj.isFlexible) {
      const duration = Number(obj.duration);
      if (Number.isFinite(duration) && duration > 0 && duration <= 240) {
        clean.push({
          ...base,
          isFlexible: true,
          duration,
          preferredTimeSlots: Array.isArray(obj.preferredTimeSlots) ? obj.preferredTimeSlots.slice(0, 3) : ['anytime'],
          earliestStart: isTime(obj.earliestStart) ? obj.earliestStart : '06:00',
          latestEnd: isTime(obj.latestEnd) ? obj.latestEnd : '22:00'
        } as ScheduleItem);
      }
      continue;
    }

    // Assume FIXED if start/end present
    if (isTime(obj.start) && isTime(obj.end)) {
      clean.push({ ...base, start: obj.start, end: obj.end } as ScheduleItem);
    }
  }
  return clean;
}
