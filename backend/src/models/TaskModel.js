import { supabase, isSupabaseConfigured, getLocalDb, saveLocalDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class TaskModel {
  static async find({
    userId,
    status,
    priority,
    projectId,
    search,
    dueDate,
    dueFilter, // 'today', 'upcoming', 'overdue'
    labelId,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50
  }) {
    // If Supabase is configured and connected
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name, color),
          subtasks(*),
          task_labels(label_id, label:labels(*)),
          reminders(*)
        `, { count: 'exact' })
        .eq('user_id', userId);

      if (status) {
        if (status === 'active') {
          query = query.in('status', ['todo', 'in_progress']);
        } else {
          query = query.eq('status', status);
        }
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (dueFilter === 'today') {
        query = query.eq('due_date', todayStr);
      } else if (dueFilter === 'overdue') {
        query = query.lt('due_date', todayStr).neq('status', 'completed');
      } else if (dueFilter === 'upcoming') {
        query = query.gt('due_date', todayStr);
      } else if (dueDate) {
        query = query.eq('due_date', dueDate);
      }

      // Sorting
      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);

      // Format response to flatten labels
      const formatted = (data || []).map(t => ({
        ...t,
        labels: (t.task_labels || []).map(tl => tl.label).filter(Boolean)
      }));

      return {
        tasks: formatted,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }

    // Local DB Fallback (100% relational integrity and user isolation)
    const db = getLocalDb();
    let tasks = db.tasks.filter(t => t.user_id === userId);

    if (status) {
      if (status === 'active') {
        tasks = tasks.filter(t => ['todo', 'in_progress'].includes(t.status));
      } else {
        tasks = tasks.filter(t => t.status === status);
      }
    }

    if (priority) {
      tasks = tasks.filter(t => t.priority === priority);
    }

    if (projectId) {
      tasks = tasks.filter(t => t.project_id === projectId);
    }

    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dueFilter === 'today') {
      tasks = tasks.filter(t => t.due_date === todayStr);
    } else if (dueFilter === 'overdue') {
      tasks = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'completed');
    } else if (dueFilter === 'upcoming') {
      tasks = tasks.filter(t => t.due_date && t.due_date > todayStr);
    } else if (dueDate) {
      tasks = tasks.filter(t => t.due_date === dueDate);
    }

    if (labelId) {
      const taskIdsWithLabel = db.task_labels
        .filter(tl => tl.label_id === labelId)
        .map(tl => tl.task_id);
      tasks = tasks.filter(t => taskIdsWithLabel.includes(t.id));
    }

    // Sort
    tasks.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'priority') {
        const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        valA = pOrder[a.priority] || 0;
        valB = pOrder[b.priority] || 0;
      }

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    const total = tasks.length;
    const startIndex = (page - 1) * limit;
    const paginatedTasks = tasks.slice(startIndex, startIndex + limit);

    // Enrich with relations
    const enriched = paginatedTasks.map(t => {
      const project = db.projects.find(p => p.id === t.project_id) || null;
      const subtasks = db.subtasks.filter(st => st.task_id === t.id);
      const labelIds = db.task_labels.filter(tl => tl.task_id === t.id).map(tl => tl.label_id);
      const labels = db.labels.filter(l => labelIds.includes(l.id));
      const reminders = db.reminders.filter(r => r.task_id === t.id);

      return {
        ...t,
        project: project ? { id: project.id, name: project.name, color: project.color } : null,
        subtasks,
        labels,
        reminders
      };
    });

    return {
      tasks: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name, color),
          subtasks(*),
          task_labels(label_id, label:labels(*)),
          reminders(*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) return null;

      return {
        ...data,
        labels: (data.task_labels || []).map(tl => tl.label).filter(Boolean)
      };
    }

    const db = getLocalDb();
    const task = db.tasks.find(t => t.id === id && t.user_id === userId);
    if (!task) return null;

    const project = db.projects.find(p => p.id === task.project_id) || null;
    const subtasks = db.subtasks.filter(st => st.task_id === task.id);
    const labelIds = db.task_labels.filter(tl => tl.task_id === task.id).map(tl => tl.label_id);
    const labels = db.labels.filter(l => labelIds.includes(l.id));
    const reminders = db.reminders.filter(r => r.task_id === task.id);

    return {
      ...task,
      project: project ? { id: project.id, name: project.name, color: project.color } : null,
      subtasks,
      labels,
      reminders
    };
  }

  static async create({
    userId,
    projectId = null,
    title,
    description = '',
    status = 'todo',
    priority = 'medium',
    dueDate = null,
    dueTime = null,
    estimatedMinutes = 0,
    recurrence = 'none',
    labelIds = []
  }) {
    const now = new Date().toISOString();
    const taskId = uuidv4();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          id: taskId,
          user_id: userId,
          project_id: projectId || null,
          title: title.trim(),
          description: description?.trim() || '',
          status,
          priority,
          due_date: dueDate || null,
          due_time: dueTime || null,
          estimated_minutes: Number(estimatedMinutes) || 0,
          recurrence: recurrence || 'none',
          completed_at: status === 'completed' ? now : null,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Insert labels
      if (Array.isArray(labelIds) && labelIds.length > 0) {
        const rows = labelIds.map(lid => ({ task_id: taskId, label_id: lid }));
        await supabase.from('task_labels').insert(rows);
      }

      return this.findById(taskId, userId);
    }

    const db = getLocalDb();
    const newTask = {
      id: taskId,
      user_id: userId,
      project_id: projectId || null,
      title: title.trim(),
      description: description?.trim() || '',
      status,
      priority,
      due_date: dueDate || null,
      due_time: dueTime || null,
      estimated_minutes: Number(estimatedMinutes) || 0,
      recurrence: recurrence || 'none',
      completed_at: status === 'completed' ? now : null,
      created_at: now,
      updated_at: now
    };

    db.tasks.push(newTask);

    if (Array.isArray(labelIds)) {
      labelIds.forEach(lid => {
        db.task_labels.push({ task_id: taskId, label_id: lid });
      });
    }

    saveLocalDb(db);
    return this.findById(taskId, userId);
  }

  static async update(id, userId, updates, labelIds = undefined) {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: now };
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;

    if (updates.status === 'completed' && !updates.completed_at) {
      cleanUpdates.completed_at = now;
    } else if (updates.status && updates.status !== 'completed') {
      cleanUpdates.completed_at = null;
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      if (labelIds !== undefined && Array.isArray(labelIds)) {
        await supabase.from('task_labels').delete().eq('task_id', id);
        if (labelIds.length > 0) {
          const rows = labelIds.map(lid => ({ task_id: id, label_id: lid }));
          await supabase.from('task_labels').insert(rows);
        }
      }

      return this.findById(id, userId);
    }

    const db = getLocalDb();
    const index = db.tasks.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return null;

    db.tasks[index] = { ...db.tasks[index], ...cleanUpdates };

    if (labelIds !== undefined && Array.isArray(labelIds)) {
      db.task_labels = db.task_labels.filter(tl => tl.task_id !== id);
      labelIds.forEach(lid => {
        db.task_labels.push({ task_id: id, label_id: lid });
      });
    }

    saveLocalDb(db);
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    const db = getLocalDb();
    const index = db.tasks.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return null;

    const [deleted] = db.tasks.splice(index, 1);
    // Cascade delete subtasks, task_labels, and reminders
    db.subtasks = db.subtasks.filter(st => st.task_id !== id);
    db.task_labels = db.task_labels.filter(tl => tl.task_id !== id);
    db.reminders = db.reminders.filter(r => r.task_id !== id);

    saveLocalDb(db);
    return deleted;
  }
}
