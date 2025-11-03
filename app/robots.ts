import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://checkitv7.com' // Update with your actual domain

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/test-printer/', '/settings/', '/_archive/', '/ai/'],
      },
      // Allow AI bots to access /ai/ path
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'Claude-Bot', 'PerplexityBot', 'Google-Extended', 'anthropic-ai', 'Bytespider', 'Applebot-Extended', 'cohere-ai', 'YouBot'],
        allow: '/ai/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

