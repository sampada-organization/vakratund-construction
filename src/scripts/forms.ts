const REASONS: Record<string, string> = {
  fields: 'Fill the required lines and send again.',
  format: 'Check the phone, and the email if you typed one.',
  fast: 'Wait a moment, then send again.',
  rate: 'Too many notes from this network. Use call or WhatsApp.',
  store: 'The office copy is not connected yet. Use call, WhatsApp, or email.',
  github: 'The note did not reach the office inbox. Use call or WhatsApp.',
};

function stamp(form: HTMLFormElement) {
  const started = form.querySelector<HTMLInputElement>('[name="started_at"]');
  if (started && !started.value) started.value = String(Date.now());
}

function field(form: HTMLFormElement, name: string) {
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return el.value.trim();
  }
  return '';
}

function allowedHref(value: unknown, prefix: string) {
  return typeof value === 'string' && value.startsWith(prefix) ? value : '';
}

function addLink(parent: HTMLElement, href: string, text: string) {
  if (!href) return;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  parent.append(a);
}

function icsStamp(local: string, plusHours = 0) {
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return '';
  date.setHours(date.getHours() + plusHours);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function downloadIcs(when: string, topic: string, name: string) {
  const start = icsStamp(when);
  const end = icsStamp(when, 1);
  if (!start || !end) return;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vakratund Construction//Visit//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Vakratund site visit — ${topic}`,
    `DESCRIPTION:Visit for ${name}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([body], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vakratund-visit.ics';
  a.textContent = 'Add to calendar';
  return a;
}

function notify(title: string, body: string, when: string) {
  if (!('Notification' in window)) return 'This browser cannot raise a notification.';
  const show = () => {
    new Notification(title, { body });
    const at = new Date(when).getTime();
    const delay = at - Date.now();
    if (delay > 60_000 && delay < 2 * 60 * 60 * 1000) {
      window.setTimeout(() => new Notification('Vakratund — visit coming up', { body }), delay);
    }
  };
  if (Notification.permission === 'granted') {
    show();
    return 'This browser will ping you now. A second ping only happens if the visit is inside two hours and this tab stays open.';
  }
  if (Notification.permission === 'denied') {
    return 'Notifications are blocked in this browser. Use WhatsApp, email, or the calendar file.';
  }
  void Notification.requestPermission()
    .then((permission) => {
      if (permission === 'granted') show();
    })
    .catch(() => {});
  return 'Allow the notification if you want this browser to ping you.';
}

function paint(form: HTMLFormElement, payload: Record<string, unknown>) {
  const slot = form.querySelector<HTMLElement>('[data-result]');
  if (!slot) return;
  slot.replaceChildren();
  if (form.dataset.kind === 'meeting' && payload.channels && typeof payload.channels === 'object') {
    const channels = payload.channels as Record<string, unknown>;
    const p = document.createElement('p');
    p.textContent = 'The visit is noted. Nothing is sent by a paid gateway — open the channel you want:';
    slot.append(p);
    const nav = document.createElement('p');
    addLink(nav, allowedHref(channels.whatsapp, 'https://wa.me/'), 'Open WhatsApp');
    addLink(nav, allowedHref(channels.email, 'mailto:'), 'Open email');
    const file = downloadIcs(String(payload.when || ''), String(payload.topic || ''), String(payload.name || ''));
    if (file) nav.append(file);
    slot.append(nav);
    const notifyInfo = channels.notify as { title?: string; body?: string } | undefined;
    const line = document.createElement('p');
    line.className = 'note';
    line.textContent = notify(
      notifyInfo?.title || 'Vakratund — visit noted',
      notifyInfo?.body || 'Visit noted',
      String(payload.when || ''),
    );
    slot.append(line);
    return;
  }
  const p = document.createElement('p');
  p.textContent = 'Received. If it is urgent, use call, WhatsApp, or email in the header.';
  slot.append(p);
}

export function bindForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-endpoint]').forEach((form) => {
    stamp(form);
    const topic = new URLSearchParams(location.search).get('topic');
    const select = form.querySelector<HTMLSelectElement>('[name="topic"], [name="work"]');
    if (topic && select) {
      const match = [...select.options].find((option) => option.value === topic);
      if (match) select.value = topic;
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (button) button.disabled = true;
      const body: Record<string, string> = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === 'string') body[key] = value;
      });
      try {
        const response = await fetch(form.dataset.endpoint || '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const slot = form.querySelector<HTMLElement>('[data-result]');
        if (!response.ok || payload.ok === false) {
          if (slot) {
            slot.textContent = REASONS[String(payload.reason || '')] || 'The desk did not take that note.';
          }
          return;
        }
        paint(form, payload);
        form.reset();
        stamp(form);
      } catch {
        const slot = form.querySelector<HTMLElement>('[data-result]');
        if (slot) slot.textContent = 'The desk did not answer. Use call or WhatsApp.';
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
}
