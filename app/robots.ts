import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://checkitv7.com' // Update with your actual domain
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/test-printer/', '/settings/', '/_archive/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

