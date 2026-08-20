// Rutas de primer nivel que ya existen en el frontend (app/*) — un username
// igual a cualquiera de estas quedaría inalcanzable en /:username.
export const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'login',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  '_next',
]);
