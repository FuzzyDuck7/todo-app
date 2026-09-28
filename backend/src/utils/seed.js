import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/UserModel.js';
import { ProjectModel } from '../models/ProjectModel.js';
import { TaskModel } from '../models/TaskModel.js';
import { SubtaskModel } from '../models/SubtaskModel.js';
import { LabelModel } from '../models/LabelModel.js';
import { ReminderModel } from '../models/ReminderModel.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 Starting TaskFlow development seed process...');

  const demoEmail = 'demo@taskflow.dev';
  const demoPassword = 'Password123!';

  let demoUser = await UserModel.findByEmail(demoEmail);
  if (!demoUser) {
    const password_hash = await bcrypt.hash(demoPassword, 10);
    demoUser = await UserModel.create({
      name: 'Alex Johnson',
      email: demoEmail,
      password_hash,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    console.log(`👤 Created Demo User: ${demoEmail}`);
  } else {
    console.log(`👤 Demo User already exists: ${demoEmail}`);
  }

  const userId = demoUser.id;

  // Create Projects
  const existingProjects = await ProjectModel.findByUserId(userId);
  let projectsMap = {};

  if (existingProjects.length === 0) {
    const p1 = await ProjectModel.create({
      userId,
      name: 'College & Academics',
      description: 'Courses, assignments, and exam prep for Semester',
      color: '#6366f1'
    });
    const p2 = await ProjectModel.create({
      userId,
      name: 'Work & Career',
      description: 'Job applications, portfolio enhancements, and client deliverables',
      color: '#0ea5e9'
    });
    const p3 = await ProjectModel.create({
      userId,
      name: 'Personal & Fitness',
      description: 'Habits, workouts, nutrition, and home errands',
      color: '#10b981'
    });
    const p4 = await ProjectModel.create({
      userId,
      name: 'Open Source',
      description: 'Contributing to open source dev tools and libraries',
      color: '#f59e0b'
    });
    projectsMap = { college: p1.id, work: p2.id, personal: p3.id, oss: p4.id };
    console.log('📁 Created default projects');
  } else {
    existingProjects.forEach(p => {
      projectsMap[p.name.toLowerCase()] = p.id;
    });
  }

  // Create Labels
  const existingLabels = await LabelModel.findByUserId(userId);
  let labelMap = {};

  if (existingLabels.length === 0) {
    const l1 = await LabelModel.create({ userId, name: 'High Priority', color: '#ef4444' });
    const l2 = await LabelModel.create({ userId, name: 'Frontend', color: '#3b82f6' });
    const l3 = await LabelModel.create({ userId, name: 'Backend', color: '#8b5cf6' });
    const l4 = await LabelModel.create({ userId, name: 'Exam Prep', color: '#ec4899' });
    const l5 = await LabelModel.create({ userId, name: 'Health', color: '#10b981' });
    labelMap = { high: l1.id, frontend: l2.id, backend: l3.id, exam: l4.id, health: l5.id };
    console.log('🏷️ Created default labels');
  } else {
    existingLabels.forEach(l => {
      labelMap[l.name.toLowerCase()] = l.id;
    });
  }

  // Check existing tasks
  const { tasks: currentTasks } = await TaskModel.find({ userId, limit: 100 });
  if (currentTasks.length > 0) {
    console.log('✅ User already has tasks. Skipping task creation.');
    return;
  }

  const now = new Date();
  const formatYMD = (d) => d.toISOString().split('T')[0];

  const todayStr = formatYMD(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = formatYMD(twoDaysAgo);

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = formatYMD(threeDaysAgo);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYMD(tomorrow);

  const inThreeDays = new Date(now);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const inThreeDaysStr = formatYMD(inThreeDays);

  const inFiveDays = new Date(now);
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  const inFiveDaysStr = formatYMD(inFiveDays);

  // 1. Task: Complete React assignment (High, Due Tomorrow)
  const collegeId = projectsMap.college || Object.values(projectsMap)[0];
  const t1 = await TaskModel.create({
    userId,
    projectId: collegeId,
    title: 'Complete React assignment',
    description: 'Implement state management, unit tests, and accessible form inputs.',
    priority: 'high',
    status: 'in_progress',
    dueDate: tomorrowStr,
    dueTime: '17:00',
    estimatedMinutes: 90,
    recurrence: 'none',
    labelIds: labelMap.frontend ? [labelMap.frontend] : []
  });

  await SubtaskModel.create({ taskId: t1.id, userId, title: 'Set up component hierarchy' });
  await SubtaskModel.create({ taskId: t1.id, userId, title: 'Write integration tests' });
  const stDone = await SubtaskModel.create({ taskId: t1.id, userId, title: 'Implement custom hooks' });
  await SubtaskModel.update(stDone.id, userId, { completed: true });

  // 2. Task: Prepare for Mathematics exam (Urgent, Overdue by 1 day)
  const t2 = await TaskModel.create({
    userId,
    projectId: collegeId,
    title: 'Prepare for Mathematics exam',
    description: 'Review permutations, combinations, and probability theory.',
    priority: 'urgent',
    status: 'todo',
    dueDate: yesterdayStr,
    dueTime: '09:00',
    estimatedMinutes: 120,
    recurrence: 'none',
    labelIds: labelMap.exam ? [labelMap.exam] : []
  });

  await SubtaskModel.create({ taskId: t2.id, userId, title: 'Revise probability' });
  await SubtaskModel.create({ taskId: t2.id, userId, title: 'Revise permutations' });
  await SubtaskModel.create({ taskId: t2.id, userId, title: 'Practice binomial theorem' });
  await SubtaskModel.create({ taskId: t2.id, userId, title: 'Solve 2024 previous papers' });

  // 3. Task: Finish REST API documentation (Work, Due Today)
  const workId = projectsMap.work || Object.values(projectsMap)[1] || collegeId;
  const t3 = await TaskModel.create({
    userId,
    projectId: workId,
    title: 'Finish REST API documentation',
    description: 'Document authentication headers, query params, and error codes for Swagger.',
    priority: 'medium',
    status: 'todo',
    dueDate: todayStr,
    dueTime: '14:30',
    estimatedMinutes: 45,
    recurrence: 'none',
    labelIds: labelMap.backend ? [labelMap.backend] : []
  });

  // 4. Completed tasks in the past to establish streak & statistics
  const tComp1 = await TaskModel.create({
    userId,
    projectId: projectsMap.personal || collegeId,
    title: 'Morning 5K run and stretching',
    description: 'Target pace under 5:30/km.',
    priority: 'low',
    status: 'completed',
    dueDate: todayStr,
    estimatedMinutes: 30,
    recurrence: 'daily'
  });
  await TaskModel.update(tComp1.id, userId, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });

  const tComp2 = await TaskModel.create({
    userId,
    projectId: workId,
    title: 'Sprint planning and backlog grooming',
    description: 'Estimate user stories with tech lead.',
    priority: 'high',
    status: 'completed',
    dueDate: yesterdayStr,
    estimatedMinutes: 60
  });
  await TaskModel.update(tComp2.id, userId, {
    status: 'completed',
    completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  });

  const tComp3 = await TaskModel.create({
    userId,
    projectId: projectsMap.oss || collegeId,
    title: 'Review pull request #142 for UI bugfix',
    description: 'Verified CSS grid alignment on Firefox.',
    priority: 'medium',
    status: 'completed',
    dueDate: twoDaysAgoStr,
    estimatedMinutes: 20
  });
  await TaskModel.update(tComp3.id, userId, {
    status: 'completed',
    completed_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  });

  const tComp4 = await TaskModel.create({
    userId,
    projectId: collegeId,
    title: 'Submit Database Management Lab 3',
    description: 'PostgreSQL indexing and query optimization report.',
    priority: 'urgent',
    status: 'completed',
    dueDate: threeDaysAgoStr,
    estimatedMinutes: 90
  });
  await TaskModel.update(tComp4.id, userId, {
    status: 'completed',
    completed_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  });

  // 5. Future tasks
  await TaskModel.create({
    userId,
    projectId: projectsMap.personal || collegeId,
    title: 'Schedule annual dental checkup',
    description: 'Call Dr. Martin clinic for Thursday slot.',
    priority: 'low',
    status: 'todo',
    dueDate: inThreeDaysStr,
    estimatedMinutes: 15
  });

  await TaskModel.create({
    userId,
    projectId: projectsMap.oss || collegeId,
    title: 'Refactor state machine for auth flow',
    description: 'Migrate legacy callback handlers to async/await.',
    priority: 'high',
    status: 'todo',
    dueDate: inFiveDaysStr,
    estimatedMinutes: 75
  });

  // Reminders
  await ReminderModel.create({
    userId,
    taskId: t3.id,
    remindAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  });

  console.log('🎉 Seed completed successfully!');
  console.log('👉 Demo Credentials:');
  console.log('   Email:    demo@taskflow.dev');
  console.log('   Password: Password123!');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
