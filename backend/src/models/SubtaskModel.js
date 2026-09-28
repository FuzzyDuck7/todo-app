import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from './TaskModel.js';

export class SubtaskModel {
  static async findByTaskId(taskId, userId) {
    const parentTask = await TaskModel.findById(taskId, userId);
    if (!parentTask) return null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    }

    const db = getLocalDb();
    return db.subtasks
      .filter(st => st.task_id === taskId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  static async findById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*, tasks!inner(user_id)')
        .eq('id', id)
        .eq('tasks.user_id', userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const subtask = db.subtasks.find(st => st.id === id);
    if (!subtask) return null;

    const task = db.tasks.find(t => t.id === subtask.task_id && t.user_id === userId);
    if (!task) return null;

    return subtask;
  }

  static async create({ taskId, userId, title }) {
    const parentTask = await TaskModel.findById(taskId, userId);
    if (!parentTask) {
      const err = new Error('Task not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{
          id,
          task_id: taskId,
          title: title.trim(),
          completed: false,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const newSubtask = {
      id,
      task_id: taskId,
      title: title.trim(),
      completed: false,
      created_at: now,
      updated_at: now
    };

    db.subtasks.push(newSubtask);
    saveLocalDb(db);
    return newSubtask;
  }

  static async update(id, userId, updates) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };
    delete cleanUpdates.id;
    delete cleanUpdates.task_id;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subtasks')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.subtasks.findIndex(st => st.id === id);
    if (index === -1) return null;

    db.subtasks[index] = { ...db.subtasks[index], ...cleanUpdates };
    saveLocalDb(db);
    return db.subtasks[index];
  }

  static async delete(id, userId) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.subtasks.findIndex(st => st.id === id);
    if (index === -1) return null;

    const [deleted] = db.subtasks.splice(index, 1);
    saveLocalDb(db);
    return deleted;
  }
}
