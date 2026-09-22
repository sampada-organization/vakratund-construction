const { json, cors, readBody, clientIp, limited, storeRecord } = require('../lib');
const { clip, validEmail, validPhone, filledTooFast } = require('../validate');

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
  const work = clip(body.work, 80);
  const message = clip(body.message, 2000) || (work ? `Work: ${work}` : '');
  if (!name || !phone || !message) {
    context.res = json(req, 400, { ok: false, reason: 'fields' });
    return;
  }
  if (!validEmail(email) || !validPhone(phone) || filledTooFast(body.started_at)) {
    context.res = json(req, 400, { ok: false, reason: filledTooFast(body.started_at) ? 'fast' : 'format' });
    return;
  }
  const record = { at: new Date().toISOString(), kind: 'enquiry', name, email, phone, work, message };
  const stored = await storeRecord('enquiries', `Enquiry: ${name}`, 'enquiry', record);
  if (!stored.ok) {
    context.res = json(req, stored.reason === 'store' ? 503 : 502, { ok: false, reason: stored.reason });
    return;
  }
  context.res = json(req, 202, { ok: true, stored: stored.stored });
};
