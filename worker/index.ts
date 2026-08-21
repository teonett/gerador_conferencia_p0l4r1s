import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GET as getChecklists, POST as postChecklist } from '../app/api/checklists/route';
import { PUT as putChecklist, DELETE as deleteChecklist } from '../app/api/checklists/[id]/route';
import { POST as postResponse } from '../app/api/checklists/[id]/responses/route';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: { fetch: typeof fetch };
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/api/checklists', (c) => getChecklists(c.req.raw, c.env));
app.post('/api/checklists', (c) => postChecklist(c.req.raw, c.env));
app.put('/api/checklists/:id', (c) => putChecklist(c.req.raw, c.env, { id: c.req.param('id') }));
app.delete('/api/checklists/:id', (c) => deleteChecklist(c.req.raw, c.env, { id: c.req.param('id') }));
app.post('/api/checklists/:id/responses', (c) =>
  postResponse(c.req.raw, c.env, { id: c.req.param('id') })
);

app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
