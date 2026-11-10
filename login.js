import crypto from 'node:crypto';
import { makeToken, json } from './_lib.js';
const eq = (a, b) => crypto.timingSafeEqual(
  crypto.createHash('sha256').update(String(a)).digest(),
  crypto.createHash('sha256').update(String(b)).digest());
const fails = new Map();
export default {
  async fetch(req) {
    if (req.method === 'DELETE')
      return json({ ok: true }, 200, { 'Set-Cookie': 'pvm=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict' });
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw) return json({ error: 'ADMIN_PASSWORD is not set' }, 500);
    const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0];
    const f = fails.get(ip) || { n: 0, t: 0 };
    if (f.n >= 5 && Date.now() - f.t < 9e5) return json({ error: 'Too many tries' }, 429);
    let b = {}; try { b = await req.json(); } catch {}
    if (!eq(b.password || '', pw)) { fails.set(ip, { n: f.n + 1, t: Date.now() }); return json({ error: 'Wrong password' }, 401); }
    fails.delete(ip);
    return json({ ok: true }, 200, { 'Set-Cookie': `pvm=${makeToken()}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict` });
  },
};
