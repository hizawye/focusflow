import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all schedule items for a user on a specific date
export const getScheduleItems = query({
  args: {
    userId: v.string(),
    date: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    const scheduleItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();

    // Get subtasks for each schedule item
    const itemsWithSubtasks = await Promise.all(
      scheduleItems.map(async (item) => {
        const subtasks = await ctx.db
          .query("subtasks")
          .withIndex("by_schedule_item", (q) => q.eq("scheduleItemId", item._id))
          .collect();
        
        return {
          ...item,
          subtasks: subtasks.map(({ scheduleItemId, createdAt, updatedAt, ...subtask }) => ({
            id: subtask._id,
            text: subtask.text,
            completed: subtask.completed,
          })),
        };
      })
    );

    return itemsWithSubtasks;
  },
});

// Create a new schedule item
export const createScheduleItem = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    start: v.optional(v.string()), // Optional for non-timed tasks
    end: v.optional(v.string()),   // Optional for non-timed tasks
    date: v.string(),
    
    // Flexible scheduling properties
    isFlexible: v.optional(v.boolean()),
    isTimeless: v.optional(v.boolean()), // New property for non-timed tasks
    duration: v.optional(v.number()),
    preferredTimeSlots: v.optional(v.array(v.string())),
    earliestStart: v.optional(v.string()),
    latestEnd: v.optional(v.string()),
    
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
    isPaused: v.optional(v.boolean()),
    pausedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    totalElapsed: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    manualStatus: v.optional(v.union(v.literal("done"), v.literal("missed"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const scheduleItemId = await ctx.db.insert("scheduleItems", {
      userId: args.userId,
      title: args.title,
      start: args.start,
      end: args.end,
      date: args.date,
      
      // Flexible scheduling properties
      isFlexible: args.isFlexible,
      isTimeless: args.isTimeless,
      duration: args.duration,
      preferredTimeSlots: args.preferredTimeSlots,
      earliestStart: args.earliestStart,
      latestEnd: args.latestEnd,
      
      remainingDuration: args.remainingDuration,
      isRunning: args.isRunning,
      isPaused: args.isPaused,
      pausedAt: args.pausedAt,
      startedAt: args.startedAt,
      totalElapsed: args.totalElapsed,
      icon: args.icon,
      color: args.color,
      manualStatus: args.manualStatus,
      createdAt: now,
      updatedAt: now,
    });
    
    return scheduleItemId;
  },
});

// Update a schedule item
export const updateScheduleItem = mutation({
  args: {
    id: v.id("scheduleItems"),
    title: v.optional(v.string()),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    
    // Flexible scheduling properties
    isFlexible: v.optional(v.boolean()),
    isTimeless: v.optional(v.boolean()),
    duration: v.optional(v.number()),
    preferredTimeSlots: v.optional(v.array(v.string())),
    earliestStart: v.optional(v.string()),
    latestEnd: v.optional(v.string()),
    
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
    isPaused: v.optional(v.boolean()),
    pausedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    totalElapsed: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    manualStatus: v.optional(v.union(v.literal("done"), v.literal("missed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a schedule item
export const deleteScheduleItem = mutation({
  args: {
    id: v.id("scheduleItems"),
  },
  handler: async (ctx, args) => {
    // Delete all subtasks first
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_schedule_item", (q) => q.eq("scheduleItemId", args.id))
      .collect();
    
    for (const subtask of subtasks) {
      await ctx.db.delete(subtask._id);
    }
    
    // Delete the schedule item
    await ctx.db.delete(args.id);
  },
});

// Bulk update schedule items (for setting entire schedule)
export const setScheduleItems = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    items: v.array(v.object({
      title: v.string(),
      start: v.optional(v.string()),
      end: v.optional(v.string()),
      
      // Flexible scheduling properties
      isFlexible: v.optional(v.boolean()),
      isTimeless: v.optional(v.boolean()),
      duration: v.optional(v.number()),
      preferredTimeSlots: v.optional(v.array(v.string())),
      earliestStart: v.optional(v.string()),
      latestEnd: v.optional(v.string()),
      
      remainingDuration: v.optional(v.number()),
      isRunning: v.optional(v.boolean()),
      isPaused: v.optional(v.boolean()),
      pausedAt: v.optional(v.number()),
      startedAt: v.optional(v.number()),
      totalElapsed: v.optional(v.number()),
      icon: v.optional(v.string()),
      color: v.optional(v.string()),
      manualStatus: v.optional(v.union(v.literal("done"), v.literal("missed"))),
    })),
  },
  handler: async (ctx, args) => {
    // Delete existing items for this user and date
    const existingItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
    
    for (const item of existingItems) {
      // Delete subtasks first
      const subtasks = await ctx.db
        .query("subtasks")
        .withIndex("by_schedule_item", (q) => q.eq("scheduleItemId", item._id))
        .collect();
      
      for (const subtask of subtasks) {
        await ctx.db.delete(subtask._id);
      }
      
      await ctx.db.delete(item._id);
    }
    
    // Insert new items
    const now = Date.now();
    const insertedIds = [];
    
    for (const item of args.items) {
      const id = await ctx.db.insert("scheduleItems", {
        userId: args.userId,
        date: args.date,
        ...item,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }
    
    return insertedIds;
  },
});

// Timer-specific mutations

// Start timer for a specific schedule item
export const startTimer = mutation({
  args: {
    id: v.id("scheduleItems"),
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // First, stop any other running timers for this user on this date
    const allItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();

    // Stop all other running timers
    for (const item of allItems) {
      if (item._id !== args.id && item.isRunning) {
        // Calculate how much time has actually elapsed for the task we are stopping
        let newTotalElapsed = item.totalElapsed || 0;

        // Only count elapsed time when the timer was actively running (not paused)
        if (!item.isPaused && item.startedAt) {
          const elapsedSeconds = Math.floor((now - item.startedAt) / 1000);
          newTotalElapsed += elapsedSeconds;
        }

        // Re-compute remaining duration if we have that field (undefined for timeless tasks)
        const newRemainingDuration = item.remainingDuration !== undefined
          ? Math.max(0, item.remainingDuration - (newTotalElapsed - (item.totalElapsed || 0)))
          : undefined;

        await ctx.db.patch(item._id, {
          isRunning: false,
          isPaused: false,
          startedAt: undefined,
          pausedAt: undefined,
          totalElapsed: newTotalElapsed,
          remainingDuration: newRemainingDuration,
          updatedAt: now,
        });
      }
    }

    // Start the requested timer
    await ctx.db.patch(args.id, {
      isRunning: true,
      isPaused: false,
      startedAt: now,
      pausedAt: undefined,
      updatedAt: now,
    });
  },
});

// Stop timer for a specific schedule item
export const stopTimer = mutation({
  args: {
    id: v.id("scheduleItems"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get current item to calculate elapsed time
    const item = await ctx.db.get(args.id);
    if (!item) return;
    
    let newTotalElapsed = item.totalElapsed || 0;
    
    // Calculate elapsed time only if the timer is actively running (not paused)
    if (item.isRunning && !item.isPaused && item.startedAt) {
      const sessionElapsed = Math.floor((now - item.startedAt) / 1000);
      newTotalElapsed += sessionElapsed;
    }
    
    // Update remaining duration (if tracked) by deducting ONLY the elapsed seconds from this session
    const newRemainingDuration = item.remainingDuration !== undefined
      ? Math.max(0, item.remainingDuration - (newTotalElapsed - (item.totalElapsed || 0)))
      : undefined;
    
    await ctx.db.patch(args.id, {
      isRunning: false,
      isPaused: false,
      startedAt: undefined,
      pausedAt: undefined,
      totalElapsed: newTotalElapsed,
      remainingDuration: newRemainingDuration,
      updatedAt: now,
    });
  },
});

// Pause timer for a specific schedule item
export const pauseTimer = mutation({
  args: {
    id: v.id("scheduleItems"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get current item to calculate elapsed time
    const item = await ctx.db.get(args.id);
    if (!item || !item.isRunning) return;
    
    let newTotalElapsed = item.totalElapsed || 0;
    
    // Add elapsed time ONLY if the timer is currently running (not already paused)
    if (!item.isPaused && item.startedAt) {
      const sessionElapsed = Math.floor((now - item.startedAt) / 1000);
      newTotalElapsed += sessionElapsed;
    }

    const newRemainingDuration = item.remainingDuration !== undefined
      ? Math.max(0, item.remainingDuration - (newTotalElapsed - (item.totalElapsed || 0)))
      : undefined;

    await ctx.db.patch(args.id, {
      isPaused: true,
      pausedAt: now,
      totalElapsed: newTotalElapsed,
      remainingDuration: newRemainingDuration,
      updatedAt: now,
    });
  },
});

// Resume timer for a specific schedule item
export const resumeTimer = mutation({
  args: {
    id: v.id("scheduleItems"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      isPaused: false,
      pausedAt: undefined,
      startedAt: now, // Reset start time for accurate calculation
      updatedAt: now,
    });
  },
});

// Update timer duration in real-time
export const updateTimerDuration = mutation({
  args: {
    id: v.id("scheduleItems"),
    remainingDuration: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      remainingDuration: args.remainingDuration,
      updatedAt: Date.now(),
    });
  },
});

// Get currently running timer for a user on a specific date
export const getRunningTimer = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const runningItem = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("isRunning"), true))
      .first();
    
    return runningItem;
  },
});

// === DELTA QUERY: fetch only items updated since timestamp ===
export const getScheduleItemsSince = query({
  args: {
    userId: v.string(),
    date: v.string(),
    since: v.optional(v.number()), // unix ms timestamp
  },
  handler: async (ctx, { userId, date, since }) => {
    let q = ctx.db
      .query("scheduleItems")
      .withIndex("by_user_and_date", q => q.eq("userId", userId).eq("date", date));

    if (since !== undefined) {
      q = q.filter(qInner => qInner.gt(qInner.field("updatedAt"), since));
    }

    const rows = await q.collect();
    return rows;
  },
});

// === BATCH UPDATE REMAINING DURATIONS ===
export const batchUpdateDurations = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("scheduleItems"),
      remainingDuration: v.number(),
    })),
  },
  handler: async (ctx, { updates }) => {
    const now = Date.now();
    await Promise.all(
      updates.map(u => ctx.db.patch(u.id, { remainingDuration: u.remainingDuration, updatedAt: now }))
    );
  },
});
