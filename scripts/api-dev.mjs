#!/usr/bin/env node
import http from 'node:http';
import { createRequire } from 'node:module';

process.env.CMS_PASSWORD ||= 'vakratund-dev';

const require = createRequire(import.meta.url);
const enquiry = require('../api/enquiry/index.js');
const meeting = require('../api/meeting/index.js');
const onboard = require('../api/onboard/index.js');
const cms = require('../api/cms/index.js');
const inbox = require('../api/inbox/index.js');

const PORT = Number(process.env.API_PORT || 8788);
const routes = {
  '/api/enquiry': enquiry,
  '/enquiry': enquiry,
  '/api/meeting': meeting,
  '/meeting': meeting,
  '/api/onboard': onboard,
  '/onboard': onboard,
  '/api/cms': cms,
  '/cms': cms,
  '/api/inbox': inbox,
  '/inbox': inbox,
};

function invoke(handler, req, res) {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
    const context = { res: {}, log: { warn() {}, error() {} } };
    await handler(context, { method: req.method, headers: req.headers, body });
    const out = context.res || {};
    res.writeHead(out.status || 200, out.headers || { 'Content-Type': 'application/json' });
    res.end(typeof out.body === 'string' ? out.body : JSON.stringify(out.body ?? {}));
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  const handler = routes[url.pathname];
  if (!handler) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  invoke(handler, req, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Vakratund API on http://127.0.0.1:${PORT}`);
});
