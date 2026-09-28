import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class LabelModel {
  static async findByUserId(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    }

    const db = getLocalDb();
    return db.labels
      .filter(l => l.user_id === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  static async findById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    return db.labels.find(l => l.id === id && l.user_id === userId) || null;
  }

  static async create({ userId, name, color = '#3b82f6' }) {
    const cleanName = name.trim();
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('labels')
        .insert([{
          user_id: userId,
          name: cleanName,
          color,
          created_at: now
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    // Check uniqueness per user
    const existing = db.labels.find(l => l.user_id === userId && l.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      const err = new Error('Label already exists with this name');
      err.statusCode = 409;
      throw err;
    }

    const newLabel = {
      id: uuidv4(),
      user_id: userId,
      name: cleanName,
      color,
      created_at: now
    };

    db.labels.push(newLabel);
    saveLocalDb(db);
    return newLabel;
  }

  static async update(id, userId, updates) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('labels')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.labels.findIndex(l => l.id === id && l.user_id === userId);
    if (index === -1) return null;

    db.labels[index] = { ...db.labels[index], ...cleanUpdates };
    saveLocalDb(db);
    return db.labels[index];
  }

  static async delete(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.labels.findIndex(l => l.id === id && l.user_id === userId);
    if (index === -1) return null;

    const [deleted] = db.labels.splice(index, 1);
    db.task_labels = db.task_labels.filter(tl => tl.label_id !== id);
    saveLocalDb(db);
    return deleted;
  }
}
