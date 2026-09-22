type Row = Record<string, string | number>;

interface Bundle {
  site: {
    tagline: string;
    promise: string;
    measure: string;
    safety: string;
    phoneDisplay: string;
    phoneTel: string;
    phoneWa: string;
    email: string;
    proprietorEmail: string;
    proprietor: string;
    hours: string;
    mission: string[];
    office: { lines: string[]; maps: string };
    [key: string]: unknown;
  };
  services: Row[];
  projects: Row[];
  plants: { intro: string; register: Row[]; earlier: Row[] };
  clients: Row[];
  resources: Row[];
  process: Row[];
}

interface Field {
  key: string;
  label: string;
  area?: boolean;
  number?: boolean;
}

const FIELDS: Record<string, Field[]> = {
  services: [
    { key: 'title', label: 'Title' },
    { key: 'summary', label: 'Summary', area: true },
  ],
  projects: [
    { key: 'slug', label: 'Slug' },
    { key: 'title', label: 'Title' },
    { key: 'summary', label: 'Summary', area: true },
    { key: 'image', label: 'Image path' },
    { key: 'width', label: 'Width', number: true },
    { key: 'height', label: 'Height', number: true },
  ],
  register: [
    { key: 'name', label: 'Name' },
    { key: 'count', label: 'Count', number: true },
    { key: 'note', label: 'Note', area: true },
  ],
  earlier: [
    { key: 'name', label: 'Name' },
    { key: 'note', label: 'Note', area: true },
  ],
  clients: [
    { key: 'name', label: 'Name' },
    { key: 'place', label: 'Place' },
  ],
  resources: [
    { key: 'title', label: 'Title' },
    { key: 'kind', label: 'Kind' },
    { key: 'href', label: 'Path' },
    { key: 'note', label: 'Note', area: true },
  ],
  process: [
    { key: 'title', label: 'Title' },
    { key: 'text', label: 'Text', area: true },
  ],
};

let bundle: Bundle | null = null;
let password = '';

function say(text: string) {
  const el = document.querySelector('[data-desk-msg]');
  if (el) el.textContent = text;
}

function headers() {
  return { 'Content-Type': 'application/json', 'X-CMS-Password': password };
}

function readValue(name: string) {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-site="${name}"]`);
  return el?.value.trim() || '';
}

function writeValue(name: string, value: string) {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-site="${name}"]`);
  if (el) el.value = value;
}

function makeRow(list: string, data: Row) {
  const wrap = document.createElement('div');
  wrap.className = 'row';
  wrap.dataset.row = list;
  for (const field of FIELDS[list]) {
    const label = document.createElement('label');
    label.append(document.createTextNode(`${field.label} `));
    const input = field.area ? document.createElement('textarea') : document.createElement('input');
    input.dataset.field = field.key;
    if (field.number) {
      (input as HTMLInputElement).type = 'number';
      (input as HTMLInputElement).min = '0';
      input.dataset.type = 'number';
    }
    input.value = data[field.key] == null ? '' : String(data[field.key]);
    label.append(input);
    wrap.append(label);
  }
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  const up = document.createElement('button');
  up.type = 'button';
  up.textContent = 'Move up';
  up.addEventListener('click', () => {
    const prev = wrap.previousElementSibling;
    if (prev) wrap.parentElement?.insertBefore(wrap, prev);
  });
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => wrap.remove());
  actions.append(up, remove);
  wrap.append(actions);
  return wrap;
}

function paintList(list: string, rows: Row[]) {
  const host = document.querySelector<HTMLElement>(`[data-list="${list}"]`);
  if (!host) return;
  host.replaceChildren(...rows.map((row) => makeRow(list, row)));
}

function paint(next: Bundle) {
  bundle = next;
  writeValue('tagline', next.site.tagline);
  writeValue('promise', next.site.promise);
  writeValue('measure', next.site.measure);
  writeValue('safety', next.site.safety);
  writeValue('phoneDisplay', next.site.phoneDisplay);
  writeValue('phoneTel', next.site.phoneTel);
  writeValue('phoneWa', next.site.phoneWa);
  writeValue('email', next.site.email);
  writeValue('proprietorEmail', next.site.proprietorEmail);
  writeValue('proprietor', next.site.proprietor);
  writeValue('hours', next.site.hours);
  writeValue('lines', (next.site.office?.lines || []).join('\n'));
  writeValue('maps', next.site.office?.maps || '');
  writeValue('mission', (next.site.mission || []).join('\n'));
  writeValue('plants-intro', next.plants.intro);
  paintList('services', next.services);
  paintList('projects', next.projects);
  paintList('register', next.plants.register);
  paintList('earlier', next.plants.earlier);
  paintList('clients', next.clients);
  paintList('resources', next.resources);
  paintList('process', next.process);
}

function collectList(list: string): Row[] {
  const rows = document.querySelectorAll<HTMLElement>(`[data-list="${list}"] [data-row]`);
  return [...rows].map((row) => {
    const item: Row = {};
    row.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach((input) => {
      const key = input.dataset.field || '';
      item[key] = input.dataset.type === 'number' ? Number(input.value || 0) : input.value.trim();
    });
    return item;
  });
}

function collect(): Bundle | null {
  if (!bundle) return null;
  const next = structuredClone(bundle);
  next.site.tagline = readValue('tagline');
  next.site.promise = readValue('promise');
  next.site.measure = readValue('measure');
  next.site.safety = readValue('safety');
  next.site.phoneDisplay = readValue('phoneDisplay');
  next.site.phoneTel = readValue('phoneTel');
  next.site.phoneWa = readValue('phoneWa');
  next.site.email = readValue('email');
  next.site.proprietorEmail = readValue('proprietorEmail');
  next.site.proprietor = readValue('proprietor');
  next.site.hours = readValue('hours');
  next.site.office = next.site.office || { lines: [], maps: '' };
  next.site.office.lines = readValue('lines').split('\n').map((line) => line.trim()).filter(Boolean);
  next.site.office.maps = readValue('maps');
  next.site.mission = readValue('mission').split('\n').map((line) => line.trim()).filter(Boolean);
  next.plants.intro = readValue('plants-intro');
  next.services = collectList('services');
  next.projects = collectList('projects');
  next.plants.register = collectList('register');
  next.plants.earlier = collectList('earlier');
  next.clients = collectList('clients');
  next.resources = collectList('resources');
  next.process = collectList('process');
  return next;
}

function addButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const list = button.dataset.add || '';
      const host = document.querySelector(`[data-list="${list}"]`);
      host?.append(makeRow(list, {}));
    });
  });
}

async function openDesk(event: Event) {
  event.preventDefault();
  const input = document.querySelector<HTMLInputElement>('[name="password"]');
  password = input?.value || '';
  const response = await fetch('/api/cms', { headers: headers() });
  const payload = (await response.json().catch(() => ({}))) as Bundle & { hint?: string };
  if (!response.ok) {
    say(response.status === 401 ? 'That password does not open the desk.' : 'The desk did not open.');
    return;
  }
  paint(payload);
  document.querySelector<HTMLElement>('#editor')?.removeAttribute('hidden');
  say('Desk open. Saving writes the content files on this computer. The live free host does not write files.');
}

async function save() {
  const next = collect();
  if (!next) return;
  if (next.projects.some((project) => !project.slug || !project.title)) {
    say('Every project needs a slug and a title.');
    return;
  }
  const response = await fetch('/api/cms', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(next),
  });
  const payload = (await response.json().catch(() => ({}))) as { hint?: string; reason?: string };
  if (response.status === 403) {
    say(payload.hint || 'The live site is edited in git, then rebuilt.');
    return;
  }
  if (!response.ok) {
    say('The save was refused. Check the lists and try again.');
    return;
  }
  bundle = next;
  say('Saved on this computer. Rebuild or refresh the dev site to see it.');
}

async function loadInbox() {
  const response = await fetch('/api/inbox', { headers: headers() });
  const slot = document.querySelector<HTMLElement>('[data-inbox]');
  if (!slot) return;
  const payload = (await response.json().catch(() => ({}))) as { hint?: string };
  if (!response.ok) {
    slot.textContent = payload.hint || 'The inbox did not open.';
    return;
  }
  slot.replaceChildren();
  for (const [name, rows] of Object.entries(payload)) {
    if (name === 'hint') continue;
    const heading = document.createElement('h3');
    heading.textContent = name;
    slot.append(heading);
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      const empty = document.createElement('p');
      empty.textContent = 'None yet.';
      slot.append(empty);
      continue;
    }
    for (const row of list) {
      const pre = document.createElement('pre');
      pre.textContent = Object.entries(row as Record<string, unknown>)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      slot.append(pre);
    }
  }
}

export function bootDesk() {
  addButtons();
  document.querySelector('#gate')?.addEventListener('submit', (event) => void openDesk(event));
  document.querySelector('#save')?.addEventListener('click', () => void save());
  document.querySelector('#inbox-load')?.addEventListener('click', () => void loadInbox());
}
