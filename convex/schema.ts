import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scheduleItems: defineTable({
    userId: v.string(),
    title: v.string(),
    start: v.string(),
    end: v.string(),
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
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
    userId: v.string(),
    scheduleItemId: v.id("scheduleItems"),
    completed: v.boolean(),
    date: v.string(), // ISO date string
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_date", ["userId", "date"]),
});
