import { put, list } from '@vercel/blob';
import { isAdmin, json } from './_lib.js';
const KEY = 'site-config.json';
export default {
  async fetch(req) {
    if (req.method === 'GET') {
      let config = null;
      try {
        const { blobs } = await list({ prefix: KEY, limit: 1 });
        if (blobs[0]) { const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) config = await r.json(); }
      } catch {}
      return json({ config, admin: isAdmin(req) });
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return json({ error: 'Not allowed' }, 401);
      const text = await req.text();
      if (text.length > 200000) return json({ error: 'Too large' }, 413);
      let c; try { c = JSON.parse(text); } catch { return json({ error: 'Bad JSON' }, 400); }
      if (!c || typeof c !== 'object' || Array.isArray(c)) return json({ error: 'Bad data' }, 400);
      await put(KEY, JSON.stringify(c), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 0 });
      return json({ ok: true });
    }
    return json({ error: 'method' }, 405);
  },
};
