/// <reference types="react" />
import React from 'react'; 
import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link'; 
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; 
import { getTranslations } from 'next-intl/server';

// Interfejsy i typy pozostają bez zmian

interface GamingArticle {
  id: number;
  title: string;
  content: string;
  title_pl: string;
  content_pl: string;
  url: string;
  source: string;
  published_at: string;
  slug_en: string;
  slug_pl: string;
  image_url?: string;
}

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export const revalidate = 1800; 

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: articles, error } = await supabase
    .from('gaming_articles')
    .select('slug_en, slug_pl');

  if (error) {
    console.error('Error fetching slugs for generateStaticParams:', error);
    return [];
  }

  if (!articles) {
    return [];
  }

  const params = articles.flatMap(article => {
    const paths = [];
    if (article.slug_en) {
      paths.push({ locale: 'en', slug: article.slug_en });
    }
    if (article.slug_pl) {
      paths.push({ locale: 'pl', slug: article.slug_pl });
    }
    return paths;
  });

  return params;
}

// Funkcja do generowania metadanych strony
export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Szukamy artykułu po slug_en LUB slug_pl
  const { data: article } = await supabase
    .from('gaming_articles')
    .select('*')
    .or(`slug_en.eq.${slug},slug_pl.eq.${slug}`)
    .single();

  if (!article) {
    return {
      title: locale === 'pl' ? 'Artykuł nie znaleziony' : 'Article not found',
    };
  }

  const title = locale === 'pl' ? article.title_pl || article.title : article.title;
  const description = locale === 'pl' 
    ? article.content_pl?.substring(0, 160) || article.content?.substring(0, 160) || ''
    : article.content?.substring(0, 160) || '';

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `https://yourdomain.com/${locale}/gaming/${slug}`,
      languages: {
        'en': `https://web-toast.vercel.app/en/gaming/${article.slug_en}`,
        'pl': `https://web-toast.vercel.app/pl/gaming/${article.slug_pl}`,
      },
    },
  };
}

export default async function GamingArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Szukamy artykułu po slug_en LUB slug_pl
  const { data: article, error } = await supabase
    .from('gaming_articles')
    .select('*')
    .or(`slug_en.eq.${slug},slug_pl.eq.${slug}`)
    .single();

  if (error || !article) {
    console.error('Error fetching article:', error);
    notFound();
  }

  // Sprawdzamy, czy slug w URL jest zgodny z locale
  const correctSlug = locale === 'pl' ? article.slug_pl : article.slug_en;
  if (slug !== correctSlug) {
    // Przekierowujemy na poprawny URL z odpowiednim slugiem
    redirect(`/${locale}/gaming/${correctSlug}`);
  }

  const t = await getTranslations('GamingArticlePage');
  const isPolish = locale === 'pl';

  const title = isPolish && article.title_pl ? article.title_pl : article.title;
  const content = isPolish && article.content_pl ? article.content_pl : article.content;
  const publishedDate = new Date(article.published_at).toLocaleDateString(
    isPolish ? 'pl-PL' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        isPolish ? 'pl-PL' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );
    } catch (e) {
      console.error("Error formatting date:", e, "Date string:", dateString);
      return dateString; 
    }
  };

  const applyInlineFormatting = (text: string): (string | JSX.Element)[] => {
    if (!text) return [];
    
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Formatowanie tekstu: **pogrubienie**, *kursywa*, ***pogrubienie i kursywa***
    const regex = /(\*\*\*([^*]+?)\*\*\*)|(\*\*([^*]+?)\*\*)|(\*([^*]+?)\*)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Dodaj tekst przed dopasowaniem
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Sprawdź typ formatowania i dodaj odpowiedni element
      if (match[1]) { // ***pogrubienie i kursywa***
        parts.push(<strong key={`${match.index}-bolditalic`}><em>{match[2]}</em></strong>);
      } else if (match[3]) { // **pogrubienie**
        parts.push(<strong key={`${match.index}-bold`}>{match[4]}</strong>);
      } else if (match[5]) { // *kursywa*
        parts.push(<em key={`${match.index}-italic`}>{match[6]}</em>);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };
  
  const formatContent = (contentToFormat: string) => {
    if (!contentToFormat) return null;
    
    return contentToFormat.split('\n\n').map((paragraphBlock, blockIndex) => {
      const trimmedBlock = paragraphBlock.trim();
      const lines = trimmedBlock.split('\n').map(l => l.trim());
      
      let isListBlock = lines.length > 0 && lines.every(line => line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* '));
      let introText: string | null = null;
      let listLines = lines;

      if (!isListBlock && lines.length > 1) {
        const firstLineIsListItemMarker = lines[0].startsWith('- ') || lines[0].startsWith('• ') || lines[0].startsWith('* ');
        if (!firstLineIsListItemMarker) {
            const subsequentLinesAreList = lines.slice(1).every(line => line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* '));
            if (subsequentLinesAreList && lines.slice(1).length > 0) {
                introText = lines[0];
                listLines = lines.slice(1);
                isListBlock = true;
            }
        }
      }

      if (isListBlock && listLines.length > 0) {
        return (
          <div key={`listdiv-${blockIndex}`} className="mb-4">
            {introText && <p className="mb-2">{applyInlineFormatting(introText)}</p>}
            <ul className="list-disc pl-6 space-y-1 marker:text-blue-600">
              {listLines.map((item, itemIndex) => {
                const itemText = item.substring(item.indexOf(' ') + 1).trim();
                return (
                  <li key={`li-${blockIndex}-${itemIndex}`} className="text-gray-800">
                    {applyInlineFormatting(itemText)}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      
      return (
        <p key={`p-${blockIndex}`} className="mb-4 leading-relaxed text-gray-800">
          {applyInlineFormatting(trimmedBlock)}
        </p>
      );
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-40">
      <Link 
        href={`/${locale}/gaming`} 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {t('backToList')}
      </Link>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {article.image_url && (
          <div className="relative h-96 overflow-hidden">
            <img 
              src={article.image_url} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>{t('publishedOn')} {formatDate(article.published_at)}</span>
          </div>
          
          <div className="prose max-w-none">
            {formatContent(content)}
          </div>
        </div>
      </article>
    </div>
  );
}
