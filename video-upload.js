import { handleUpload } from '@vercel/blob/client';
import { isAdmin, json } from './_lib.js';
export default {
  async fetch(req) {
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    try {
      const body = await req.json();
      const res = await handleUpload({
        body, request: req,
        onBeforeGenerateToken: async () => {
          if (!isAdmin(req)) throw new Error('Not allowed');
          return {
            allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'],
            maximumSizeInBytes: 300 * 1024 * 1024,
            addRandomSuffix: true,
          };
        },
        onUploadCompleted: async () => {},
      });
      return json(res);
    } catch (e) { return json({ error: String((e && e.message) || e) }, 400); }
  },
};
