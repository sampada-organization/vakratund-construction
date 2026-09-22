const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
let writeChain = Promise.resolve();

function requestOrigin(req) {
  return String(req.headers?.origin || req.headers?.Origin || '');
}

function allowOrigin(req) {
  const origin = requestOrigin(req);
  if (!origin) return '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (/^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$/i.test(origin)) return origin;
  if (/^https:\/\/([a-z0-9-]+\.)?vakrtundconstruction\.in$/i.test(origin)) return origin;
  if (/^http:\/\/(127\.0\.0\.1|localhost):4322$/i.test(origin)) return origin;
  return '';
}

function cors(req, status, body) {
  const origin = allowOrigin(req);
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Headers': 'Content-Type, X-CMS-Password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '600',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return {
    status,
    headers,
    body: body === undefined || body === '' ? '' : JSON.stringify(body),
  };
}

function json(req, status, body) {
  return cors(req, status, body);
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function clientIp(req) {
  const fwd = String(req.headers?.['x-forwarded-for'] || '');
  return (fwd.split(',')[0] || req.headers?.['x-client-ip'] || 'unknown').trim();
}

function limited(ip) {
  const now = Date.now();
  const row = hits.get(ip) || [];
  const fresh = row.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_PER_WINDOW) {
    hits.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  hits.set(ip, fresh);
  return false;
}

function authorized(req) {
  const expected = process.env.CMS_PASSWORD || '';
  const got = String(req.headers?.['x-cms-password'] || req.headers?.['X-CMS-Password'] || '');
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (!expected || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function dataFile(kind) {
  return path.join(__dirname, '..', '.data', `${kind}.json`);
}

function appendLocal(kind, record) {
  writeChain = writeChain.then(() => {
    const file = dataFile(kind);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    existing.push(record);
    fs.writeFileSync(file, JSON.stringify(existing, null, 2) + '\n');
  });
  return writeChain;
}

function readLocal(kind) {
  const file = dataFile(kind);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function issueBody(record) {
  const lines = [
    '_Submitted via the Vakratund desk. Keep this in the private inbox, not on the public site._',
    '',
  ];
  for (const [key, value] of Object.entries(record)) {
    lines.push(`**${key}:** ${value}`);
  }
  return lines.join('\n');
}

async function githubIssue(title, label, record) {
  const token = process.env.ENQUIRY_GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return { ok: false, status: 0 };
  const post = async (withLabel) => {
    const payload = { title, body: issueBody(record) };
    if (withLabel) payload.labels = [label];
    return fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'vakratund-desk',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(payload),
    });
  };
  let res = await post(true);
  if (res.status === 422) res = await post(false);
  return { ok: res.ok, status: res.status };
}

async function storeRecord(kind, title, label, record) {
  const token = process.env.ENQUIRY_GITHUB_TOKEN;
  const onAzure = Boolean(process.env.WEBSITE_HOSTNAME);
  if (!token && onAzure) return { ok: false, reason: 'store' };
  if (!token) {
    await appendLocal(kind, record);
    return { ok: true, stored: 'local' };
  }
  const issue = await githubIssue(title, label, record);
  if (!issue.ok) return { ok: false, reason: 'github' };
  return { ok: true, stored: 'github' };
}

module.exports = {
  cors,
  json,
  readBody,
  clientIp,
  limited,
  authorized,
  storeRecord,
  readLocal,
};
