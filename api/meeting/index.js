const { json, cors, readBody, clientIp, limited, storeRecord } = require('../lib');
const { clip, validEmail, validPhone, filledTooFast, validWhen } = require('../validate');
const { meetingChannels } = require('../channels');

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = cors(req, 204);
    return;
  }
  if (limited(clientIp(req))) {
    context.res = json(req, 429, { ok: false, reason: 'rate' });
    return;
  }
  const body = readBody(req);
  if (body.company_website) {
    context.res = json(req, 200, { ok: true });
    return;
  }
  const name = clip(body.name, 80);
  const email = clip(body.email, 120);
  const phone = clip(body.phone, 20);
  const when = clip(body.when, 40);
  const topic = clip(body.topic, 80);
  const place = clip(body.place, 160);
  const note = clip(body.note, 1000);
  if (!name || !phone || !when || !topic) {
    context.res = json(req, 400, { ok: false, reason: 'fields' });
    return;
  }
  if (!validEmail(email) || !validPhone(phone) || !validWhen(when)) {
    context.res = json(req, 400, { ok: false, reason: 'format' });
    return;
  }
  if (filledTooFast(body.started_at)) {
    context.res = json(req, 400, { ok: false, reason: 'fast' });
    return;
  }
  const record = { at: new Date().toISOString(), kind: 'meeting', name, email, phone, when, topic, place, note };
  const stored = await storeRecord('meetings', `Meeting: ${name} — ${topic}`, 'meeting', record);
  if (!stored.ok) {
    context.res = json(req, stored.reason === 'store' ? 503 : 502, { ok: false, reason: stored.reason });
    return;
  }
  context.res = json(req, 202, {
    ok: true,
    stored: stored.stored,
    channels: meetingChannels(record),
    when,
    topic,
    name,
  });
};
