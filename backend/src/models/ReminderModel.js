import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class ReminderModel {
  static async findByUserId(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, task:tasks(id, title, due_date)')
        .eq('user_id', userId)
        .order('remind_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    }

    const db = getLocalDb();
    const reminders = db.reminders.filter(r => r.user_id === userId);
    return reminders.map(r => {
      const task = db.tasks.find(t => t.id === r.task_id);
      return {
        ...r,
        task: task ? { id: task.id, title: task.title, due_date: task.due_date } : null
      };
    }).sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));
  }

  static async findById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    return db.reminders.find(r => r.id === id && r.user_id === userId) || null;
  }

  static async create({ userId, taskId, remindAt }) {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          id,
          user_id: userId,
          task_id: taskId,
          remind_at: remindAt,
          is_completed: false,
          created_at: now
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const newReminder = {
      id,
      user_id: userId,
      task_id: taskId,
      remind_at: remindAt,
      is_completed: false,
      created_at: now
    };

    db.reminders.push(newReminder);
    saveLocalDb(db);
    return newReminder;
  }

  static async update(id, userId, updates) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;
    delete cleanUpdates.task_id;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.reminders.findIndex(r => r.id === id && r.user_id === userId);
    if (index === -1) return null;

    db.reminders[index] = { ...db.reminders[index], ...cleanUpdates };
    saveLocalDb(db);
    return db.reminders[index];
  }

  static async delete(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.reminders.findIndex(r => r.id === id && r.user_id === userId);
    if (index === -1) return null;

    const [deleted] = db.reminders.splice(index, 1);
    saveLocalDb(db);
    return deleted;
  }
}
