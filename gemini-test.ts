// Test file to verify Gemini improvements with flexible scheduling
import { 
  generateScheduleWithGemini, 
  generateDailyScheduleWithGemini, 
  generateScheduleWithContext,
  generateFlexibleScheduleWithGemini,
  suggestFlexibleTaskTimes
} from './gemini';

// Note: This is just a reference file showing how to use the improved functions
// Actual testing would require API key and should be done in a proper test environment

const testExamples = {
  // Basic single task generation
  singleTask: async () => {
    const result = await generateScheduleWithGemini("morning workout");
    // Expected faster response with better formatting
    console.log('Single task result:', result);
  },

  // Flexible task generation (NEW)
  flexibleTask: async () => {
    const result = await generateFlexibleScheduleWithGemini("1 hour workout");
    // Expected: flexible task with duration and preferred time slots
    console.log('Flexible task result:', result);
  },

  // Full daily schedule generation
  dailySchedule: async () => {
    const result = await generateDailyScheduleWithGemini("productive workday for a software developer");
    // Expected 5-10 items with realistic timing, mix of fixed and flexible
    console.log('Daily schedule result:', result);
  },

  // Context-aware scheduling with flexibility
  contextAwareFlexible: async () => {
    const existingItems = [
      { title: "Morning Meeting", start: "09:00", end: "10:00" },
      { title: "Lunch", start: "12:00", end: "13:00" }
    ];
    
    const result = await generateScheduleWithContext("45 min deep work session", existingItems);
    // Expected to avoid conflicts and suggest flexible scheduling
    console.log('Context-aware flexible result:', result);
  },

  // Smart time suggestions for flexible tasks (NEW)
  smartTimeSuggestions: () => {
    const flexibleTask = {
      title: "Study Session",
      isFlexible: true,
      duration: 90,
      preferredTimeSlots: ["morning"],
      earliestStart: "08:00",
      latestEnd: "18:00"
    };

    const existingItems = [
      { title: "Meeting", start: "09:00", end: "10:00" },
      { title: "Lunch", start: "12:00", end: "13:00" }
    ];

    const result = suggestFlexibleTaskTimes(flexibleTask, existingItems);
    console.log('Smart time suggestions:', result);
  }
};

// Key improvements made:
const improvements = {
  original: [
    "Better system prompt with clear instructions and examples",
    "Lower temperature (0.1) for more consistent responses", 
    "Enhanced JSON extraction with multiple fallback methods",
    "Context-aware scheduling to avoid conflicts",
    "Daily schedule generation for full day planning",
    "Better error handling with detailed error messages"
  ],
  
  flexibleScheduling: [
    "Support for duration-based tasks (e.g., '1 hour workout')",
    "Flexible vs fixed task differentiation",
    "AI-powered time slot suggestions",
    "Preferred time slots (morning/afternoon/evening)",
    "Smart conflict avoidance for flexible tasks",
    "Natural language understanding for duration ('1h', '30 min', '2 hours')"
  ],
  
  dataStructure: [
    "isFlexible: boolean flag for task type",
    "duration: minutes for flexible tasks", 
    "preferredTimeSlots: array of preferred times",
    "earliestStart/latestEnd: time constraints",
    "suggestedStart/End: AI-computed optimal times"
  ]
};

// Example prompts that now work with flexible scheduling:
const examplePrompts = {
  flexible: [
    "1 hour workout",
    "30 min meditation anytime", 
    "2 hours coding session in the morning",
    "45 min reading before bed"
  ],
  
  fixed: [
    "meeting at 2pm",
    "lunch from 12 to 1pm", 
    "call at 9:30am"
  ],
  
  mixed: [
    "meeting at 2pm and 1 hour prep time",
    "lunch at 12pm, then 30 min walk"
  ]
};

export { testExamples, improvements, examplePrompts };
