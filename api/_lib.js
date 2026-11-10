import crypto from 'node:crypto';
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');
export const makeToken = () => { const p = String(Date.now() + 7 * 864e5); return p + '.' + sign(p); };
export function isAdmin(req) {
  if (!secret()) return false;
  const m = (req.headers.get('cookie') || '').match(/(?:^|; )pvm=([^;]+)/);
  if (!m) return false;
  const [p, s] = m[1].split('.');
  if (!p || !s || Number(p) < Date.now()) return false;
  const a = Buffer.from(sign(p)), b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export const json = (o, status = 200, h = {}) =>
  new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...h } });
