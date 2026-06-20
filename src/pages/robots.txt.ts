import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /dashboard/

Sitemap: ${site}sitemap-index.xml
`,
    {
      headers: { 'Content-Type': 'text/plain' },
    }
  );
};