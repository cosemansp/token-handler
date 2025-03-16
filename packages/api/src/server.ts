import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

const app = new Hono();
app.use(logger());

app.use('*', (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  console.log('token: ', token);
  return next();
});

app.get('/', (c) => {
  return c.json({
    message: 'Hello World',
  });
});

app.get('/api/users', (c) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    { id: 3, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 4, name: 'Alice Johnson', email: 'alice@example.com' },
  ];
  return c.json(users);
});

app.get('/api/tasks', (c) => {
  const tasks = [
    { id: 1, title: 'Task 1', description: 'Description 1' },
    { id: 2, title: 'Task 2', description: 'Description 2' },
    { id: 3, title: 'Task 3', description: 'Description 3' },
    { id: 4, title: 'Task 4', description: 'Description 4' },
  ];
  return c.json(tasks);
});

const POST = 8080;
console.log(`\nAPI server listening on http://localhost:${POST}`);
serve({
  fetch: app.fetch,
  port: POST,
});
