// UWAGA: Powyższy kod może nie działać bezpośrednio z Next.js MetadataRoute.Sitemap
// Jeśli chcesz pełną funkcjonalność News i Image sitemap, możesz potrzebować:

import { generateKeywords, getGamingArticles, isRecentArticle } from "../sitemap";

// 1. Osobnej route dla XML sitemap (app/sitemap.xml/route.ts):
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.webtoast.dev' : 'http://localhost:3000'

export async function GET() {
  const articles = await getGamingArticles()
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${articles.map(article => {
    const urlPath = article.locale === 'pl' ? `/gaming/${article.slug}` : `/en/gaming/${article.slug}`;
    
    return `<url>
      <loc>${baseUrl}${urlPath}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      ${isRecentArticle(article.publishedAt) ? `
      <news:news>
        <news:publication>
          <news:name>WebToast</news:name>
          <news:language>${article.locale}</news:language>
        </news:publication>
        <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
        <news:title>${article.title}</news:title>
        <news:keywords>${generateKeywords(article.title, article.content)}</news:keywords>
      </news:news>` : ''}
      ${article.imageUrl ? `
      <image:image>
        <image:loc>${article.imageUrl}</image:loc>
        <image:title>${article.title}</image:title>
      </image:image>` : ''}
    </url>`
  }).join('')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
