import { TaskModel } from '../models/TaskModel.js';
import { ProjectModel } from '../models/ProjectModel.js';

export class AnalyticsService {
  /**
   * Calculate complete summary analytics for the user
   */
  static async getSummary(userId) {
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });
    const projects = await ProjectModel.findByUserId(userId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalCompleted = completedTasks.length;

    const activeTasks = tasks.filter(t => ['todo', 'in_progress'].includes(t.status));
    const totalActive = activeTasks.length;

    // Overdue tasks: due_date < today AND status != completed
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'completed');
    const totalOverdue = overdueTasks.length;

    // Today tasks
    const todayTasks = tasks.filter(t => t.due_date === todayStr);
    const completedToday = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      const compDateStr = new Date(t.completed_at).toISOString().split('T')[0];
      return compDateStr === todayStr;
    });

    // On-time completion: completed tasks where completed_at <= due_date (end of day)
    let completedOnTime = 0;
    let totalCompletedWithDueDate = 0;
    let totalCompletionDurationHours = 0;
    let durationCount = 0;

    completedTasks.forEach(t => {
      if (t.due_date && t.completed_at) {
        totalCompletedWithDueDate++;
        const dueDate = new Date(`${t.due_date}T23:59:59`);
        const completedDate = new Date(t.completed_at);
        if (completedDate <= dueDate) {
          completedOnTime++;
        }
      }

      if (t.created_at && t.completed_at) {
        const createdDate = new Date(t.created_at);
        const completedDate = new Date(t.completed_at);
        const diffHours = (completedDate - createdDate) / (1000 * 60 * 60);
        if (diffHours >= 0) {
          totalCompletionDurationHours += diffHours;
          durationCount++;
        }
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const onTimeRate = totalCompletedWithDueDate > 0 ? Math.round((completedOnTime / totalCompletedWithDueDate) * 100) : 100;
    const averageCompletionHours = durationCount > 0 ? Math.round((totalCompletionDurationHours / durationCount) * 10) / 10 : 0;

    // Streak calculation (consecutive days user completed at least 1 task)
    const streak = this.calculateStreak(completedTasks);

    // Productivity Score calculation (0 - 100)
    // Formula: (completionRate * 0.4) + (onTimeRate * 0.3) + (max(0, 100 - (overdueRatio * 100)) * 0.2) + (min(streak * 2, 10) * 1)
    const overdueRatio = totalActive > 0 ? Math.min(totalOverdue / totalActive, 1) : 0;
    const overduePenaltyScore = Math.max(0, 100 - (overdueRatio * 100));
    const streakScore = Math.min(streak * 2, 10);
    const productivityScore = totalTasks > 0
      ? Math.min(100, Math.round((completionRate * 0.4) + (onTimeRate * 0.3) + (overduePenaltyScore * 0.2) + streakScore))
      : 0;

    return {
      totalTasks,
      totalActive,
      totalCompleted,
      totalOverdue,
      todayTasksCount: todayTasks.length,
      completedTodayCount: completedToday.length,
      completionRate,
      onTimeRate,
      completedOnTime,
      averageCompletionHours,
      streak,
      productivityScore,
      projectsCount: projects.length
    };
  }

  /**
   * Time series completion data for line chart
   */
  static async getCompletionTrends(userId, days = 14) {
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });

    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const completedCount = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completed_at) return false;
        return t.completed_at.startsWith(dateStr);
      }).length;

      const createdCount = tasks.filter(t => {
        if (!t.created_at) return false;
        return t.created_at.startsWith(dateStr);
      }).length;

      result.push({
        date: dateStr,
        displayLabel,
        completed: completedCount,
        created: createdCount
      });
    }

    return result;
  }

  /**
   * Tasks grouped by priority for bar chart
   */
  static async getPrioritiesBreakdown(userId) {
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });

    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    tasks.forEach(t => {
      const p = (t.priority || 'medium').toLowerCase();
      if (counts[p] !== undefined) {
        counts[p]++;
      }
    });

    return [
      { priority: 'Low', key: 'low', count: counts.low, color: '#3b82f6' },
      { priority: 'Medium', key: 'medium', count: counts.medium, color: '#eab308' },
      { priority: 'High', key: 'high', count: counts.high, color: '#f97316' },
      { priority: 'Urgent', key: 'urgent', count: counts.urgent, color: '#ef4444' }
    ];
  }

  /**
   * Tasks grouped by project for bar chart
   */
  static async getProjectsBreakdown(userId) {
    const projects = await ProjectModel.findByUserId(userId);
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });

    const breakdown = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      return {
        id: project.id,
        name: project.name,
        color: project.color || '#6366f1',
        total: projectTasks.length,
        completed,
        pending: projectTasks.length - completed
      };
    });

    // Also include tasks without project (Inbox)
    const unassignedTasks = tasks.filter(t => !t.project_id);
    if (unassignedTasks.length > 0) {
      const unassignedCompleted = unassignedTasks.filter(t => t.status === 'completed').length;
      breakdown.unshift({
        id: 'unassigned',
        name: 'No Project (Inbox)',
        color: '#94a3b8',
        total: unassignedTasks.length,
        completed: unassignedCompleted,
        pending: unassignedTasks.length - unassignedCompleted
      });
    }

    return breakdown;
  }

  /**
   * Status breakdown for donut/pie chart
   */
  static async getStatusBreakdown(userId) {
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });

    const counts = {
      todo: 0,
      in_progress: 0,
      completed: 0,
      archived: 0
    };

    tasks.forEach(t => {
      const s = (t.status || 'todo').toLowerCase();
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });

    return [
      { status: 'To Do', key: 'todo', count: counts.todo, color: '#64748b' },
      { status: 'In Progress', key: 'in_progress', count: counts.in_progress, color: '#3b82f6' },
      { status: 'Completed', key: 'completed', count: counts.completed, color: '#10b981' },
      { status: 'Archived', key: 'archived', count: counts.archived, color: '#94a3b8' }
    ];
  }

  /**
   * Generates genuine data-grounded insights and smart productivity suggestions
   */
  static async getInsights(userId) {
    const { tasks } = await TaskModel.find({ userId, limit: 10000 });
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const insights = [];
    const suggestions = [];

    // Week boundaries
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const completedLast7Days = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      const compDate = new Date(t.completed_at);
      return compDate >= oneWeekAgo && compDate <= now;
    }).length;

    const completedPrior7Days = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      const compDate = new Date(t.completed_at);
      return compDate >= twoWeeksAgo && compDate < oneWeekAgo;
    }).length;

    // Overdue tasks
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'completed');

    // Due in next 7 days
    const next7DaysStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dueNext7Days = tasks.filter(t => t.due_date && t.due_date >= todayStr && t.due_date <= next7DaysStr && t.status !== 'completed');

    // Active urgent & high tasks
    const activeTasks = tasks.filter(t => ['todo', 'in_progress'].includes(t.status));
    const urgentTasks = activeTasks.filter(t => t.priority === 'urgent');
    const highTasks = activeTasks.filter(t => t.priority === 'high');

    // 1. Completion velocity insight
    if (completedLast7Days > 0) {
      if (completedLast7Days > completedPrior7Days && completedPrior7Days > 0) {
        insights.push({
          type: 'positive',
          title: 'Momentum is Rising',
          message: `You completed ${completedLast7Days} tasks this week, up from ${completedPrior7Days} last week.`
        });
      } else {
        insights.push({
          type: 'info',
          title: 'Weekly Output',
          message: `You completed ${completedLast7Days} tasks in the last 7 days.`
        });
      }
    }

    // 2. Overdue insight
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Attention Required',
        message: `You currently have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? '' : 's'}.`
      });
    }

    // 3. Upcoming deadline insight
    if (dueNext7Days.length > 0) {
      insights.push({
        type: 'info',
        title: 'Upcoming Deadlines',
        message: `You have ${dueNext7Days.length} task${dueNext7Days.length === 1 ? '' : 's'} scheduled within the next 7 days.`
      });
    }

    // 4. Weekday vs Weekend completion pattern
    let weekdayCompletions = 0;
    let weekendCompletions = 0;
    tasks.filter(t => t.status === 'completed' && t.completed_at).forEach(t => {
      const day = new Date(t.completed_at).getDay();
      if (day === 0 || day === 6) {
        weekendCompletions++;
      } else {
        weekdayCompletions++;
      }
    });

    if (weekdayCompletions + weekendCompletions >= 5) {
      if (weekdayCompletions > weekendCompletions * 2) {
        insights.push({
          type: 'neutral',
          title: 'Peak Productivity Pattern',
          message: 'You complete the vast majority of your tasks during weekdays.'
        });
      }
    }

    // SMART PRODUCTIVITY RECOMMENDATIONS (Rule-based)
    if (overdueTasks.length >= 5) {
      suggestions.push({
        priority: 'high',
        title: 'Overdue Backlog Review',
        advice: `You have ${overdueTasks.length} overdue tasks. Consider rescheduling or breaking them down into smaller manageable chunks.`
      });
    }

    if (urgentTasks.length >= 4) {
      suggestions.push({
        priority: 'high',
        title: 'High Urgency Alert',
        advice: `You have ${urgentTasks.length} tasks marked as Urgent. When everything is urgent, burnout risk increases. Consider re-evaluating priority levels.`
      });
    }

    // Check if any active task has 4+ subtasks
    const taskWithManySubtasks = activeTasks.find(t => (t.subtasks || []).length >= 4);
    if (taskWithManySubtasks) {
      suggestions.push({
        priority: 'medium',
        title: 'Decompose Complex Work',
        advice: `"${taskWithManySubtasks.title}" has ${taskWithManySubtasks.subtasks.length} subtasks. Tackle 1-2 subtasks per session to maintain steady momentum.`
      });
    }

    // Group active tasks by due_date to detect deadline clustering
    const dateCounts = {};
    activeTasks.forEach(t => {
      if (t.due_date) {
        dateCounts[t.due_date] = (dateCounts[t.due_date] || 0) + 1;
      }
    });

    for (const [dateStr, count] of Object.entries(dateCounts)) {
      if (count >= 4) {
        const formattedDate = new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        suggestions.push({
          priority: 'medium',
          title: 'Deadline Clustering',
          advice: `You have ${count} tasks due on ${formattedDate}. Consider starting some earlier to prevent last-minute rushes.`
        });
        break;
      }
    }

    if (suggestions.length === 0) {
      suggestions.push({
        priority: 'low',
        title: 'Smooth Sailing',
        advice: 'Your task distribution is balanced. Keep focusing on high-impact tasks one at a time.'
      });
    }

    return {
      insights,
      suggestions
    };
  }

  /**
   * Helper to calculate daily streak based on completed_at dates
   */
  static calculateStreak(completedTasks) {
    if (!completedTasks || completedTasks.length === 0) return 0;

    const completedDates = new Set(
      completedTasks
        .filter(t => t.completed_at)
        .map(t => new Date(t.completed_at).toISOString().split('T')[0])
    );

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(today);

    // If no completion today, streak might still be active from yesterday
    if (!completedDates.has(todayStr)) {
      if (!completedDates.has(yesterdayStr)) {
        return 0;
      }
      checkDate = yesterday;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
