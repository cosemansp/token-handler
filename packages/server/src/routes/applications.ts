import { Hono } from 'hono';
import {
  applicationsCreate200Schema,
  applicationsDeletePathParamsSchema,
  applicationsGetPathParamsSchema,
  applicationsList200Schema,
  applicationsUpdatePathParamsSchema,
} from '../schema';
import auth from '@/middleware/auth';
import { zValidator } from '@hono/zod-validator';
import { Application } from '@/models/applications';

const router = new Hono();

router.use('*', auth);
router.get('/', (c) => {
  const apps = [
    {
      id: '1',
      displayName: 'Test',
      roles: ['admin', 'user'],
      description: 'Test application',
      slug: 'test',
      config: [
        {
          displayName: 'Test',
          clientId: '1',
          scopes: ['test'],
          domain: 'test',
          redirectUrl: 'test',
          backendUrl: 'test',
        },
      ],
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    },
  ] as Application[];

  const data = applicationsList200Schema.parse(apps);
  return c.json(data);
});

router.get('/:id', zValidator('param', applicationsGetPathParamsSchema), async (c) => {
  const { id } = c.req.valid('param');
  // TODO: Implement actual database query
  const app = {
    id,
    displayName: 'Test',
    roles: ['admin', 'user'],
    description: 'Test application',
    slug: 'test',
    config: [
      {
        displayName: 'Test',
        clientId: '1',
        scopes: ['test'],
        domain: 'test',
        redirectUrl: 'test',
        backendUrl: 'test',
      },
    ],
    createdOn: '2021-01-01',
    updatedOn: new Date().toISOString(),
  } as Application;

  return c.json(app);
});

router.put(
  '/:id',
  zValidator('param', applicationsUpdatePathParamsSchema),
  zValidator('json', applicationsCreate200Schema),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = await c.req.valid('json');

    // TODO: Implement actual database update
    const updatedApp = {
      ...body,
      id,
      createdOn: '2021-01-01', // This should come from the existing record
      updatedOn: new Date().toISOString(),
    } as Application;

    return c.json(updatedApp);
  },
);

router.post('/', zValidator('json', applicationsCreate200Schema), async (c) => {
  const body = await c.req.valid('json');
  console.log('>>>>>', body);

  // TODO: Implement validation using applicationSchema
  // TODO: Implement actual database creation
  const newApp = {
    ...body,
    id: crypto.randomUUID(),
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
  } as Application;

  return c.json(newApp);
});

router.delete('/:id', zValidator('param', applicationsDeletePathParamsSchema), async (c) => {
  const { id } = c.req.valid('param');

  // TODO: Implement actual database deletion
  const deletedApp = {
    id,
    displayName: 'Test',
    roles: ['admin', 'user'],
    description: 'Test application',
    slug: 'test',
    config: [],
    createdOn: '2021-01-01',
    updatedOn: '2021-01-01',
  } as Application;

  return c.json(deletedApp);
});

export default router;
