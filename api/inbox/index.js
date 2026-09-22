const { json, cors, authorized, readLocal } = require('../lib');

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = cors(req, 204);
    return;
  }
  if (!authorized(req)) {
    context.res = json(req, 401, { ok: false });
    return;
  }
  if (process.env.WEBSITE_HOSTNAME) {
    context.res = json(req, 403, {
      ok: false,
      reason: 'production-inbox',
      hint: 'Messages sent from the published site are kept by the office.',
    });
    return;
  }
  context.res = json(req, 200, {
    enquiries: readLocal('enquiries'),
    meetings: readLocal('meetings'),
    clients: readLocal('clients'),
  });
};
