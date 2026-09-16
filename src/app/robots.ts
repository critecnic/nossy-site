import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/data/', '/admin', '/api/admin', '/api/agent'],
      },
    ],
    // Sitemap INDEX (gerado no build): divide as vagas por país
    // (sitemap-usa.xml, sitemap-germany.xml...) + páginas por idioma
    sitemap: 'https://nossy.pro/sitemap.xml',
  };
}
