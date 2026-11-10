import { put } from '@vercel/blob';
import { isAdmin, json } from './_lib.js';
export default {
  async fetch(req) {
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    if (!isAdmin(req)) return json({ error: 'Not allowed' }, 401);
    const type = req.headers.get('content-type') || '';
    if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) return json({ error: 'Images only' }, 415);
    const name = (new URL(req.url).searchParams.get('name') || 'photo').replace(/[^\w.-]/g, '_');
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 4.2 * 1024 * 1024) return json({ error: 'Too large' }, 413);
    const b = await put('uploads/' + name, buf, { access: 'public', addRandomSuffix: true, contentType: type });
    return json({ url: b.url });
  },
};
