import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/'], // Protege rutas internas o transaccionales
    },
    sitemap: 'https://mogu.cl/sitemap.xml',
  };
}