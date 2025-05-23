import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Inicjalizacja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Rozszerzona definicja typu sitemap z News i Image schemas
interface ExtendedSitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  // News schema
  news?: {
    publication: {
      name: string
      language: string
    }
    publication_date: string
    title: string
    keywords?: string
  }
  // Image schema
  images?: Array<{
    loc: string
    title?: string
    caption?: string
  }>
}

// Funkcja do pobierania artykułów gaming z dodatkowymi danymi dla News sitemap
export async function getGamingArticles() {
  try {
    const { data: articles, error } = await supabase
      .from('gaming_articles')
      .select('slug_en, slug_pl, updated_at, published_at, title, title_pl, image_url, content, content_pl')
      .order('published_at', { ascending: false })
      .limit(1000) // Google News sitemap limit

    if (error) {
      console.error('Supabase error:', error)
      return []
    }

    const routes: Array<{
      slug: string
      updatedAt: string
      publishedAt: string
      locale: string
      title: string
      imageUrl?: string
      content: string
    }> = []

    articles?.forEach(article => {
      // Anglojęzyczna wersja
      if (article.slug_en) {
        routes.push({
          slug: article.slug_en,
          updatedAt: article.updated_at,
          publishedAt: article.published_at,
          locale: 'en',
          title: article.title,
          imageUrl: article.image_url,
          content: article.content || ''
        })
      }
      
      // Polskojęzyczna wersja
      if (article.slug_pl) {
        routes.push({
          slug: article.slug_pl,
          updatedAt: article.updated_at,
          publishedAt: article.published_at,
          locale: 'pl',
          title: article.title_pl || article.title,
          imageUrl: article.image_url,
          content: article.content_pl || article.content || ''
        })
      }
    })

    return routes
  } catch (error) {
    console.error('Error fetching gaming articles:', error)
    return []
  }
}

// Funkcja do generowania keywords z contentu
export function generateKeywords(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  
  // Podstawowe gaming keywords
  const gamingKeywords = ['gaming', 'gry', 'gra', 'games', 'game', 'recenzja', 'review', 'test', 'gameplay']
  
  // Wyciągnij najczęstsze słowa (proste podejście)
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10)
  
  return [...new Set([...gamingKeywords.slice(0, 3), ...words.slice(0, 7)])].join(', ')
}

// Funkcja do sprawdzenia czy artykuł jest "świeży" (ostatnie 2 dni) dla News sitemap
export function isRecentArticle(publishedAt: string): boolean {
  const articleDate = new Date(publishedAt)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  return articleDate >= twoDaysAgo
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.webtoast.dev' : 'http://localhost:3000'

  // Statyczne strony
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/gaming`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/gaming`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Dynamiczne artykuły gaming z rozszerzonymi informacjami
  const gamingArticles = await getGamingArticles()
  const gamingRoutes: MetadataRoute.Sitemap = gamingArticles.map((article) => {
    const urlPath = article.locale === 'pl' 
      ? `/gaming/${article.slug}` 
      : `/en/gaming/${article.slug}`;
    
    const sitemapEntry: ExtendedSitemapEntry = {
      url: `${baseUrl}${urlPath}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }

    // Dodaj News schema dla świeżych artykułów (ostatnie 2 dni)
    if (isRecentArticle(article.publishedAt)) {
      sitemapEntry.news = {
        publication: {
          name: 'WebToast',
          language: article.locale
        },
        publication_date: new Date(article.publishedAt).toISOString(),
        title: article.title,
        keywords: generateKeywords(article.title, article.content)
      }
    }

    // Dodaj Image schema jeśli artykuł ma obraz
    if (article.imageUrl) {
      sitemapEntry.images = [{
        loc: article.imageUrl,
        title: article.title,
        caption: article.title
      }]
    }

    return sitemapEntry
  })

  return [...staticRoutes, ...gamingRoutes]
}
