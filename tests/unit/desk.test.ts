import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import clients from '../../src/content/clients.json';
import plants from '../../src/content/plants.json';
import projects from '../../src/content/projects.json';
import services from '../../src/content/services.json';
import site from '../../src/content/site.json';

const require = createRequire(import.meta.url);

function invoke(handler: Function, req: object) {
  const context: { res?: { status: number; body: string; headers: Record<string, string> }; log: { warn: () => void } } = {
    log: { warn() {} },
  };
  return Promise.resolve(handler(context, req)).then(() => context.res!);
}

describe('published facts', () => {
  it('keeps the office identity that was actually supplied', () => {
    expect(site.established).toBe(2007);
    expect(site.governmentWorkSince).toBe(2016);
    expect(site.phoneTel).toBe('+919960532729');
    expect(site.email).toBe('vakratundconstructionchakan@gmail.com');
    expect(site.proprietor).toBe('Prajot Vikas Dhadge');
    expect(site.office.lines.join(' ')).toContain('Grand Centre');
    expect(JSON.stringify(site)).not.toContain('9970099700');
    expect(services).toHaveLength(6);
    expect(clients.map((client) => client.name)).toContain('SANY');
    expect(clients.every((client) => client.logo.startsWith('/media/clients/'))).toBe(true);
    expect(plants.register.find((item) => item.name === 'Transit mixer')?.count).toBe(5);
    expect(projects).toHaveLength(8);
  });

  it('mirrors content into the API package', () => {
    const files = fs.readdirSync('src/content').filter((file) => file.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = fs.readFileSync(path.join('src/content', file), 'utf8');
      const copy = fs.readFileSync(path.join('api/content', file), 'utf8');
      expect(copy).toBe(source);
    }
  });
});

describe('enquiry API', () => {
  it('rejects a note with no phone and does not open CORS to a stranger', async () => {
    const handler = require('../../api/enquiry/index.js');
    const res = await invoke(handler, {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'x-forwarded-for': '203.0.113.10' },
      body: { name: 'A', message: 'Road' },
    });
    expect(res.status).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('stores a phone note locally', async () => {
    const handler = require('../../api/enquiry/index.js');
    const res = await invoke(handler, {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:4322', 'x-forwarded-for': '203.0.113.11' },
      body: { name: 'Site Owner', phone: '9960532729', work: 'Road construction', started_at: Date.now() - 5000 },
    });
    expect(res.status).toBe(202);
    expect(JSON.parse(res.body).stored).toBe('local');
  });
});

describe('meeting API', () => {
  it('returns the four channels without calling a gateway', async () => {
    const handler = require('../../api/meeting/index.js');
    const res = await invoke(handler, {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:4322', 'x-forwarded-for': '203.0.113.12' },
      body: {
        name: 'Site lead',
        phone: '9960532729',
        when: '2026-10-02T10:30',
        topic: 'Road construction',
        place: 'Chakan',
        started_at: Date.now() - 5000,
      },
    });
    expect(res.status).toBe(202);
    const body = JSON.parse(res.body);
    expect(body.channels.whatsapp).toContain('https://wa.me/919960532729');
    expect(body.channels.email).toContain('mailto:vakratundconstructionchakan@gmail.com');
    expect(body.channels.miscall).toBeUndefined();
    expect(body.channels.notify.title).toContain('Vakratund');
  });
});

describe('onboard API', () => {
  it('stores a client record', async () => {
    const handler = require('../../api/onboard/index.js');
    const res = await invoke(handler, {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:4322', 'x-forwarded-for': '203.0.113.13' },
      body: {
        person: 'A. Patil',
        firm: 'Patil House',
        phone: '9845012345',
        location: 'Chakan',
        work: 'Plotting development',
        started_at: Date.now() - 5000,
      },
    });
    expect(res.status).toBe(202);
    expect(JSON.parse(res.body).stored).toBe('local');
  });
});

describe('cms API', () => {
  it('stays shut without the password and refuses writes on Azure', async () => {
    process.env.CMS_PASSWORD = 'test-secret';
    const handler = require('../../api/cms/index.js');
    const denied = await invoke(handler, { method: 'GET', headers: {}, body: {} });
    expect(denied.status).toBe(401);
    const opened = await invoke(handler, {
      method: 'GET',
      headers: { 'x-cms-password': 'test-secret', origin: 'http://127.0.0.1:4322' },
      body: {},
    });
    expect(opened.status).toBe(200);
    expect(JSON.parse(opened.body).services.length).toBe(6);
    expect(JSON.parse(opened.body).pages.length).toBeGreaterThan(0);
    process.env.WEBSITE_HOSTNAME = 'vakratund.azurestaticapps.net';
    try {
      const frozen = await invoke(handler, {
        method: 'POST',
        headers: { 'x-cms-password': 'test-secret' },
        body: { site: {}, services: [], projects: [], plants: { register: [], earlier: [] }, clients: [], resources: [], process: [] },
      });
      expect(frozen.status).toBe(403);
    } finally {
      delete process.env.WEBSITE_HOSTNAME;
    }
  });
});
