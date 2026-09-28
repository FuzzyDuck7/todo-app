import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('TaskFlow Backend API Test Suite', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';

  let userAProjectId = '';
  let userATaskId = '';
  let userBTaskId = '';

  const userAEmail = `usera_${Date.now()}@example.com`;
  const userBEmail = `userb_${Date.now()}@example.com`;
  const password = 'SecurePassword123!';

  // =========================================================================
  // 1. AUTHENTICATION & SECURITY
  // =========================================================================
  describe('Authentication Endpoints', () => {
    test('1.1 Should register User A successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Alpha',
          email: userAEmail,
          password
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.equal(res.body.data.user.email, userAEmail.toLowerCase());
      assert.equal(res.body.data.user.password_hash, undefined, 'Never expose password hash');

      userAToken = res.body.data.token;
      userAId = res.body.data.user.id;
    });

    test('1.2 Should prevent duplicate registration with same email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Duplicate',
          email: userAEmail,
          password
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'EMAIL_EXISTS');
    });

    test('1.3 Should register User B successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Beta',
          email: userBEmail,
          password
        });

      assert.equal(res.status, 201);
      userBToken = res.body.data.token;
      userBId = res.body.data.user.id;
    });

    test('1.4 Should login User A with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.equal(res.body.data.user.name, 'User Alpha');
    });

    test('1.5 Should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'WrongPassword999!'
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    });

    test('1.6 Should fetch profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.id, userAId);
    });

    test('1.7 Should reject access to protected route without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  // =========================================================================
  // 2. PROJECTS CRUD
  // =========================================================================
  describe('Projects Endpoints', () => {
    test('2.1 Should create project for User A', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Alpha Project',
          description: 'Project belonging to User Alpha',
          color: '#6366f1'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Alpha Project');
      userAProjectId = res.body.data.id;
    });

    test('2.2 User B should NOT be able to view User A project', async () => {
      const res = await request(app)
        .get(`/api/projects/${userAProjectId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  // =========================================================================
  // 3. TASKS CRUD & DATA ISOLATION (CRITICAL TEST)
  // =========================================================================
  describe('Tasks Endpoints & Strict User Isolation', () => {
    test('3.1 User A should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'User A Secret Task',
          description: 'Confidential details',
          priority: 'high',
          status: 'todo',
          projectId: userAProjectId,
          dueDate: '2026-10-15',
          estimatedMinutes: 60
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.title, 'User A Secret Task');
      userATaskId = res.body.data.id;
    });

    test('3.2 User B should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'User B Task',
          priority: 'medium',
          status: 'todo'
        });

      assert.equal(res.status, 201);
      userBTaskId = res.body.data.id;
    });

    test('3.3 CRITICAL: User B must NOT be able to read User A task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('3.4 CRITICAL: User B must NOT be able to update User A task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked by User B'
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('3.5 CRITICAL: User B must NOT be able to complete User A task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}/complete`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('3.6 CRITICAL: User B must NOT be able to delete User A task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('3.7 User A can update and complete own task', async () => {
      const completeRes = await request(app)
        .patch(`/api/tasks/${userATaskId}/complete`)
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(completeRes.status, 200);
      assert.equal(completeRes.body.data.status, 'completed');
      assert.ok(completeRes.body.data.completed_at);

      const reopenRes = await request(app)
        .patch(`/api/tasks/${userATaskId}/reopen`)
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(reopenRes.status, 200);
      assert.equal(reopenRes.body.data.status, 'todo');
    });
  });

  // =========================================================================
  // 4. SUBTASKS SYSTEM
  // =========================================================================
  describe('Subtasks Endpoints', () => {
    let subtaskId = '';

    test('4.1 User A can add subtask to own task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${userATaskId}/subtasks`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Subtask 1 for Alpha'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.title, 'Subtask 1 for Alpha');
      assert.equal(res.body.data.completed, false);
      subtaskId = res.body.data.id;
    });

    test('4.2 User B cannot add subtask to User A task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${userATaskId}/subtasks`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Intruder subtask'
        });

      assert.equal(res.status, 404);
    });

    test('4.3 User A can toggle subtask completion', async () => {
      const res = await request(app)
        .patch(`/api/subtasks/${subtaskId}/complete`)
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.completed, true);
    });
  });

  // =========================================================================
  // 5. ANALYTICS & INSIGHTS
  // =========================================================================
  describe('Analytics & Insights', () => {
    test('5.1 User A can retrieve calculated analytics summary', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.ok('totalTasks' in res.body.data);
      assert.ok('completionRate' in res.body.data);
      assert.ok('productivityScore' in res.body.data);
      assert.ok('streak' in res.body.data);
    });

    test('5.2 User A can retrieve data-grounded insights and suggestions', async () => {
      const res = await request(app)
        .get('/api/analytics/insights')
        .set('Authorization', `Bearer ${userAToken}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data.insights));
      assert.ok(Array.isArray(res.body.data.suggestions));
    });
  });
});
