import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scheduleItems: defineTable({
    userId: v.string(), // This will be the Clerk user ID
    title: v.string(),
    start: v.optional(v.string()), // Optional for non-timed tasks
    end: v.optional(v.string()),   // Optional for non-timed tasks
    
    // Flexible scheduling properties
    isFlexible: v.optional(v.boolean()), // If true, task can be scheduled flexibly
    isTimeless: v.optional(v.boolean()), // If true, task has no specific time (just a todo)
    duration: v.optional(v.number()), // Duration in minutes for flexible tasks
    preferredTimeSlots: v.optional(v.array(v.string())), // Preferred time slots like ['morning', 'afternoon', 'evening']
    earliestStart: v.optional(v.string()), // Earliest possible start time for flexible tasks
    latestEnd: v.optional(v.string()), // Latest possible end time for flexible tasks
    
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
    isPaused: v.optional(v.boolean()),
    pausedAt: v.optional(v.number()), // timestamp when paused
    startedAt: v.optional(v.number()), // timestamp when timer started
    totalElapsed: v.optional(v.number()), // total elapsed time in seconds
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    manualStatus: v.optional(v.union(v.literal("done"), v.literal("missed"))),
    date: v.string(), // ISO date string for the day this schedule item belongs to
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_date", ["userId", "date"]),

  subtasks: defineTable({
    scheduleItemId: v.id("scheduleItems"),
    text: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_schedule_item", ["scheduleItemId"]),

  completionStatus: defineTable({
    userId: v.string(), // This will be the Clerk user ID
    scheduleItemId: v.id("scheduleItems"),
    completed: v.boolean(),
    date: v.string(), // ISO date string
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_date", ["userId", "date"]),
});
