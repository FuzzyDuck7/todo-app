import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectModel {
  static async findByUserId(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }

    const db = getLocalDb();
    return db.projects
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  static async findById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    return db.projects.find(p => p.id === id && p.user_id === userId) || null;
  }

  static async create({ userId, name, description = '', color = '#6366f1' }) {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: userId,
          name: name.trim(),
          description: description?.trim() || '',
          color,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const newProject = {
      id: uuidv4(),
      user_id: userId,
      name: name.trim(),
      description: description?.trim() || '',
      color,
      created_at: now,
      updated_at: now
    };

    db.projects.push(newProject);
    saveLocalDb(db);
    return newProject;
  }

  static async update(id, userId, updates) {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.projects.findIndex(p => p.id === id && p.user_id === userId);
    if (index === -1) return null;

    db.projects[index] = { ...db.projects[index], ...cleanUpdates };
    saveLocalDb(db);
    return db.projects[index];
  }

  static async delete(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.projects.findIndex(p => p.id === id && p.user_id === userId);
    if (index === -1) return null;

    const [deleted] = db.projects.splice(index, 1);
    // Cascade delete or unlink project from user's tasks
    db.tasks = db.tasks.map(t => t.project_id === id ? { ...t, project_id: null } : t);
    saveLocalDb(db);
    return deleted;
  }
}
