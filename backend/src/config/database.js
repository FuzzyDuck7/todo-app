import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.trim() !== '' && 
  supabaseKey.trim() !== '' &&
  supabaseUrl.startsWith('http')
);

export let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase client initialized successfully with remote PostgreSQL database.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('ℹ️ Supabase credentials not detected in .env. Running in integrated local persistence mode.');
}

// Local persistence store for offline/development/testing reliability
const localDbPath = path.resolve(__dirname, '../../.taskflow_local_db.json');

const initialDb = {
  users: [],
  projects: [],
  tasks: [],
  subtasks: [],
  labels: [],
  task_labels: [],
  reminders: []
};

export const getLocalDb = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const data = fs.readFileSync(localDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return initialDb;
  }
};

export const saveLocalDb = (data) => {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
};
