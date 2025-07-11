// Example usage of flexible scheduling system
import { 
  generateScheduleWithGemini, 
  generateFlexibleScheduleWithGemini, 
  generateScheduleWithContext,
  suggestFlexibleTaskTimes 
} from './gemini';
import { ScheduleItem } from './types';

// Example flexible scheduling scenarios
const flexibleSchedulingExamples = {
  // Basic flexible task creation
  basicFlexibleTask: async () => {
    // User says "1 hour workout" - AI creates flexible task
    const result = await generateFlexibleScheduleWithGemini("1 hour workout");
    console.log('Flexible workout task:', result);
    // Expected: { title: "Workout Session", start: "TBD", end: "TBD", isFlexible: true, duration: 60, preferredTimeSlots: ["morning"], ... }
  },

  // Mixed schedule with fixed and flexible tasks
  mixedSchedule: async () => {
    // User says "meeting at 2pm, 30 min meditation, and 1 hour coding"
    const result = await generateScheduleWithGemini("meeting at 2pm, 30 min meditation, and 1 hour coding");
    console.log('Mixed schedule:', result);
    // Expected: fixed meeting + flexible meditation + flexible coding
  },

  // Context-aware flexible scheduling
  contextAwareFlexible: async () => {
    const existingTasks: ScheduleItem[] = [
      { title: "Morning Meeting", start: "09:00", end: "10:00" },
      { title: "Lunch", start: "12:00", end: "13:00" },
      { title: "Afternoon Call", start: "15:00", end: "16:00" }
    ];
    
    const result = await generateScheduleWithContext("45 min deep work session", existingTasks);
    console.log('Context-aware flexible task:', result);
    // Expected: flexible task that avoids conflicts with existing meetings
  },

  // Smart time suggestions for flexible tasks
  smartTimeSuggestions: () => {
    const flexibleTask: ScheduleItem = {
      title: "Study Session",
      isFlexible: true,
      duration: 90, // 1.5 hours
      preferredTimeSlots: ["morning", "afternoon"],
      earliestStart: "08:00",
      latestEnd: "18:00"
    };

    const existingTasks: ScheduleItem[] = [
      { title: "Meeting", start: "09:00", end: "10:00" },
      { title: "Lunch", start: "12:00", end: "13:00" }
    ];

    const suggestedTimes = suggestFlexibleTaskTimes(flexibleTask, existingTasks);
    console.log('Suggested times for flexible task:', suggestedTimes);
    // Expected: { start: "10:00", end: "11:30" } or { start: "13:00", end: "14:30" }
  }
};

// Key benefits of flexible scheduling:
const flexibleSchedulingBenefits = {
  userExperience: [
    "Users can say '1 hour workout' instead of '9am-10am workout'",
    "More natural language input: 'I need 30 minutes for meditation'",
    "AI finds optimal time slots automatically",
    "Less rigid scheduling - tasks adapt to available time"
  ],
  
  aiCapabilities: [
    "AI understands duration-based requests",
    "Context-aware scheduling avoids conflicts",
    "Smart time slot suggestions based on preferences",
    "Flexible rescheduling when conflicts arise"
  ],
  
  dataStructure: [
    "isFlexible: boolean flag for task type",
    "duration: minutes for flexible tasks",
    "preferredTimeSlots: morning/afternoon/evening preferences",
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
    "45 min reading before bed",
    "1.5 hours study session"
  ],
  
  fixed: [
    "meeting at 2pm",
    "lunch from 12 to 1pm",
    "call at 9:30am",
    "presentation at 3pm"
  ],
  
  mixed: [
    "meeting at 2pm and 1 hour prep time",
    "lunch at 12pm, then 30 min walk",
    "morning standup at 9am and 2 hours deep work"
  ]
};

export { flexibleSchedulingExamples, flexibleSchedulingBenefits, examplePrompts };
