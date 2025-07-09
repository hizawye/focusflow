import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get completion status for a user on a specific date
export const getCompletionStatus = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const completionStatuses = await ctx.db
      .query("completionStatus")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
    
    // Convert to the format expected by the app (object with keys)
    const result: { [key: string]: boolean } = {};
    for (const status of completionStatuses) {
      result[status.scheduleItemId] = status.completed;
    }
    
    return result;
  },
});

// Set completion status for a schedule item
export const setCompletionStatus = mutation({
  args: {
    userId: v.string(),
    scheduleItemId: v.id("scheduleItems"),
    completed: v.boolean(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if status already exists
    const existingStatus = await ctx.db
      .query("completionStatus")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("scheduleItemId"), args.scheduleItemId))
      .first();
    
    const now = Date.now();
    
    if (existingStatus) {
      // Update existing status
      await ctx.db.patch(existingStatus._id, {
        completed: args.completed,
        updatedAt: now,
      });
    } else {
      // Create new status
      await ctx.db.insert("completionStatus", {
        userId: args.userId,
        scheduleItemId: args.scheduleItemId,
        completed: args.completed,
        date: args.date,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Toggle completion status for a schedule item
export const toggleCompletionStatus = mutation({
  args: {
    userId: v.string(),
    scheduleItemId: v.id("scheduleItems"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existingStatus = await ctx.db
      .query("completionStatus")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("scheduleItemId"), args.scheduleItemId))
      .first();
    
    const now = Date.now();
    
    if (existingStatus) {
      // Toggle existing status
      await ctx.db.patch(existingStatus._id, {
        completed: !existingStatus.completed,
        updatedAt: now,
      });
    } else {
      // Create new status as completed
      await ctx.db.insert("completionStatus", {
        userId: args.userId,
        scheduleItemId: args.scheduleItemId,
        completed: true,
        date: args.date,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
