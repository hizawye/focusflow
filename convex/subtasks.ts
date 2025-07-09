import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all subtasks for a schedule item
export const getSubtasks = query({
  args: {
    scheduleItemId: v.id("scheduleItems"),
  },
  handler: async (ctx, args) => {
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_schedule_item", (q) => q.eq("scheduleItemId", args.scheduleItemId))
      .collect();
    
    return subtasks.map(({ scheduleItemId, createdAt, updatedAt, ...subtask }) => ({
      id: subtask._id,
      text: subtask.text,
      completed: subtask.completed,
    }));
  },
});

// Create a new subtask
export const createSubtask = mutation({
  args: {
    scheduleItemId: v.id("scheduleItems"),
    text: v.string(),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const subtaskId = await ctx.db.insert("subtasks", {
      scheduleItemId: args.scheduleItemId,
      text: args.text,
      completed: args.completed ?? false,
      createdAt: now,
      updatedAt: now,
    });
    
    return subtaskId;
  },
});

// Update a subtask
export const updateSubtask = mutation({
  args: {
    id: v.id("subtasks"),
    text: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a subtask
export const deleteSubtask = mutation({
  args: {
    id: v.id("subtasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle subtask completion
export const toggleSubtaskCompletion = mutation({
  args: {
    id: v.id("subtasks"),
  },
  handler: async (ctx, args) => {
    const subtask = await ctx.db.get(args.id);
    if (!subtask) {
      throw new Error("Subtask not found");
    }
    
    await ctx.db.patch(args.id, {
      completed: !subtask.completed,
      updatedAt: Date.now(),
    });
  },
});
