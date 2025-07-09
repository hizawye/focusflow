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
    start: v.string(),
    end: v.string(),
    date: v.string(),
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
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
      remainingDuration: args.remainingDuration,
      isRunning: args.isRunning,
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
    remainingDuration: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
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
      start: v.string(),
      end: v.string(),
      remainingDuration: v.optional(v.number()),
      isRunning: v.optional(v.boolean()),
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
