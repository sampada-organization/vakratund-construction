function clip(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function validEmail(value) {
  if (!value) return true;
  return value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function filledTooFast(started) {
  const t = Number(started);
  if (!Number.isFinite(t) || t <= 0) return false;
  return Date.now() - t < 2500;
}

function validWhen(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

module.exports = { clip, validEmail, validPhone, filledTooFast, validWhen };
