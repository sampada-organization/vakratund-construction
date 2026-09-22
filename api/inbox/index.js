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
      hint: 'On the live site these records are private GitHub issues, not a file on the server.',
    });
    return;
  }
  context.res = json(req, 200, {
    enquiries: readLocal('enquiries'),
    meetings: readLocal('meetings'),
    clients: readLocal('clients'),
  });
};
