import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GET as getChecklists, POST as postChecklist } from '../app/api/checklists/route';
import { PUT as putChecklist, DELETE as deleteChecklist } from '../app/api/checklists/[id]/route';
import { POST as postResponse } from '../app/api/checklists/[id]/responses/route';
import { GET as getResponses } from '../app/api/responses/route';
import { DELETE as deleteResponse } from '../app/api/responses/[id]/route';
import { GET as getSettings, POST as postSettings } from '../app/api/settings/route';
import { GET as getHeaders, POST as postHeader } from '../app/api/headers/route';
import { PUT as putHeader, DELETE as deleteHeader } from '../app/api/headers/[id]/route';
import { GET as getFile } from '../app/api/files/[...path]/route';

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
app.get('/api/responses', (c) => getResponses(c.req.raw, c.env));
app.delete('/api/responses/:id', (c) =>
  deleteResponse(c.req.raw, c.env, { id: c.req.param('id') })
);
app.get('/api/settings', (c) => getSettings(c.req.raw, c.env));
app.post('/api/settings', (c) => postSettings(c.req.raw, c.env));
app.get('/api/headers', (c) => getHeaders(c.req.raw, c.env));
app.post('/api/headers', (c) => postHeader(c.req.raw, c.env));
app.put('/api/headers/:id', (c) => putHeader(c.req.raw, c.env, { id: c.req.param('id') }));
app.delete('/api/headers/:id', (c) => deleteHeader(c.req.raw, c.env, { id: c.req.param('id') }));
app.get('/api/files/*', (c) => getFile(c.req.raw, c.env));

app.get('*', (c) => {
  if (!c.env.ASSETS) {
    return c.text('Assets não configurados (binding ASSETS ausente).', 503);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
