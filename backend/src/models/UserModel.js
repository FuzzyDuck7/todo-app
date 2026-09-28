import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  static async findById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  static async findByIdWithPassword(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    return db.users.find(u => u.id === id) || null;
  }

  static async create({ name, email, password_hash, avatar_url = null }) {
    const now = new Date().toISOString();
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          email: cleanEmail,
          password_hash,
          avatar_url,
          created_at: now,
          updated_at: now
        }])
        .select('id, name, email, avatar_url, created_at, updated_at')
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const newUser = {
      id: uuidv4(),
      name,
      email: cleanEmail,
      password_hash,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      created_at: now,
      updated_at: now
    };

    db.users.push(newUser);
    saveLocalDb(db);

    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  }

  static async update(id, updates) {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', id)
        .select('id, name, email, avatar_url, created_at, updated_at')
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    db.users[index] = { ...db.users[index], ...cleanUpdates };
    saveLocalDb(db);

    const { password_hash, ...safeUser } = db.users[index];
    return safeUser;
  }

  static async updatePassword(id, password_hash) {
    return this.update(id, { password_hash });
  }
}
