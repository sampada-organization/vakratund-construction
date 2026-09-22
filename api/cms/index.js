const fs = require('node:fs');
const path = require('node:path');
const { json, cors, readBody, authorized } = require('../lib');

const FILES = {
  site: 'site.json',
  services: 'services.json',
  projects: 'projects.json',
  plants: 'plants.json',
  clients: 'clients.json',
  resources: 'resources.json',
  process: 'process.json',
};

const PRIMARY = path.join(__dirname, '..', 'content');
const SOURCE = path.join(__dirname, '..', '..', 'src', 'content');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(PRIMARY, file), 'utf8'));
}

function loadAll() {
  const out = {};
  for (const [key, file] of Object.entries(FILES)) out[key] = readJson(file);
  return out;
}

function bundleOk(body) {
  if (!body || typeof body !== 'object') return false;
  for (const key of Object.keys(FILES)) {
    if (body[key] == null) return false;
  }
  if (!Array.isArray(body.services) || !Array.isArray(body.projects)) return false;
  if (!Array.isArray(body.clients) || !Array.isArray(body.resources) || !Array.isArray(body.process)) return false;
  if (!body.plants || !Array.isArray(body.plants.register) || !Array.isArray(body.plants.earlier)) return false;
  if (!body.site || typeof body.site !== 'object' || Array.isArray(body.site)) return false;
  if (!body.projects.every((item) => item && item.slug && item.title)) return false;
  return true;
}

function writeBoth(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  fs.mkdirSync(PRIMARY, { recursive: true });
  fs.writeFileSync(path.join(PRIMARY, name), text);
  if (fs.existsSync(path.dirname(SOURCE))) {
    fs.mkdirSync(SOURCE, { recursive: true });
    fs.writeFileSync(path.join(SOURCE, name), text);
  }
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = cors(req, 204);
    return;
  }
  if (!authorized(req)) {
    context.res = json(req, 401, { ok: false });
    return;
  }
  if (req.method === 'GET') {
    context.res = json(req, 200, loadAll());
    return;
  }
  if (process.env.WEBSITE_HOSTNAME) {
    context.res = json(req, 403, {
      ok: false,
      reason: 'production-immutable',
      hint: 'Edit src/content in git. The free Azure host does not write files.',
    });
    return;
  }
  const body = readBody(req);
  if (!bundleOk(body)) {
    context.res = json(req, 400, { ok: false, reason: 'shape' });
    return;
  }
  for (const [key, file] of Object.entries(FILES)) writeBoth(file, body[key]);
  context.res = json(req, 200, { ok: true, stored: 'local' });
};
