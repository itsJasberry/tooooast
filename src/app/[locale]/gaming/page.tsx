export const experimental_ppr = true

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FeaturedArticle as FeaturedArticleComponent } from '@/components/news/FeaturedArticle';
import blossom from "@/public/blossom.png";
import Image from 'next/image';
import { getFeaturedArticleGradientStyle } from '@/lib/getGradient';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Suspense } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GamingArticle {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
  title_pl?: string;
  content_pl?: string;
  title_en?: string;
  content_en?: string;
  slug_en?: string;
  slug_pl?: string;
  category: string;
}

export const revalidate = 1800;

const REGULAR_ARTICLES_PER_PAGE = 6;

const getBadgeVariant = (category: string) => {
  if (!category) return 'default';
  const categoryLower = category.toLowerCase();
  if (categoryLower === 'gra' || categoryLower === 'game') return 'green';
  if (categoryLower === 'film' || categoryLower === 'movie' || categoryLower === 'serial' || categoryLower === 'tv show') return 'blue';
  if (categoryLower === 'komiks' || categoryLower === 'comic') return 'purple';
  if (categoryLower === 'tech') return 'orange';
  if (categoryLower === 'inne' || categoryLower === 'other') return 'secondary';
  return 'default';
};

const getPageNumbers = (currentPage: number, totalPages: number, pageNeighbors: number = 1): (number | 'ellipsis')[] => {
  const totalNumbers = (pageNeighbors * 2) + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  const leftBound = currentPage - pageNeighbors;
  const rightBound = currentPage + pageNeighbors;

  if (leftBound > 2) {
    pages.push('ellipsis');
  }

  const startPage = Math.max(2, leftBound);
  const endPage = Math.min(totalPages - 1, rightBound);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (rightBound < totalPages - 1) {
    pages.push('ellipsis');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages.filter((page, index, self) => 
    page !== 'ellipsis' || 
    (
      page === 'ellipsis' && 
      self[index-1] !== 'ellipsis' && 
      self[index-1] !== undefined && 
      self[index+1] !== undefined &&
      // Check if neighbors are numbers before arithmetic comparison
      (typeof self[index-1] === 'number' && typeof self[index+1] === 'number' ? 
        (self[index-1] as number) + 1 !== (self[index+1] as number) : 
        true) // If not both numbers, keep ellipsis (other conditions might remove it)
    )
  ).filter((page, index, self) => 
    // Remove redundant 1,2 or N-1,N if ellipsis is not needed
    !( 
      (page === 1 && typeof self[index+1] === 'number' && self[index+1] === 2 && self[index+2] === 'ellipsis') || 
      (page === totalPages && typeof self[index-1] === 'number' && self[index-1] === totalPages-1 && self[index-2] === 'ellipsis')
    )
  );
};


async function FeaturedGamingArticleDisplay({ locale }: { locale: string }) {
  const t = await getTranslations('GamingNewsPage');
  const { data: featuredArticles, error: featuredError } = await supabase
    .from('gaming_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(1);

  if (featuredError || !featuredArticles || featuredArticles.length === 0) {
    console.error('Error fetching featured article:', featuredError);
    return null; 
  }
  const featuredArticle = featuredArticles[0];
  const featuredArticleBadgeVariant = getBadgeVariant(featuredArticle.category);

  return (
    <>
      <div className="flex items-center mb-8 space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl border px-4 py-2">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        {featuredArticle && <div className="h-1 flex-grow rounded-full" style={getFeaturedArticleGradientStyle(featuredArticleBadgeVariant)}></div>}
      </div>
      {featuredArticle && <FeaturedArticleComponent article={featuredArticle} locale={locale} badgeVariant={featuredArticleBadgeVariant} />}
    </>
  );
}

async function PaginatedRegularArticles({ 
  locale, 
  currentPage, 
  featuredArticleId 
}: { 
  locale: string, 
  currentPage: number, 
  featuredArticleId: number 
}) {
  const t = await getTranslations('GamingNewsPage');
  const offset = (currentPage - 1) * REGULAR_ARTICLES_PER_PAGE;

  const query = supabase
    .from('gaming_articles')
    .select('*', { count: 'exact' })
    .neq('id', featuredArticleId)
    .order('published_at', { ascending: false })
    .range(offset, offset + REGULAR_ARTICLES_PER_PAGE - 1);

  const { data: fetchedArticles, error, count } = await query;

  if (error) {
    console.error('Error fetching paginated gaming articles:', error);
    return <div className="py-10 text-center text-red-500">{t('errorLoading')}</div>;
  }

  const regularArticles = fetchedArticles || [];
  const totalRegularArticles = count || 0;
  const totalPages = Math.ceil(totalRegularArticles / REGULAR_ARTICLES_PER_PAGE);

  if (regularArticles.length === 0) {
    if (currentPage > 1) {
      return (
        <div className="py-10 text-center">
          <p className="text-xl text-gray-600">{t('noArticlesOnPage')}</p>
          <Link href={`/${locale}/gaming?page=1`} className="text-blue-500 hover:underline">
            {t('goToFirstPage')}
          </Link>
        </div>
      );
    } else {
      return <div className="py-10 text-center text-gray-500">{t('noMoreArticles')}</div>;
    }
  }
  
  const pageNumbersToDisplay = getPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularArticles.map((article: GamingArticle) => {
          const slug = locale === 'en' ? article.slug_en : article.slug_pl;
          const titleText = locale === 'pl' && article.title_pl ? article.title_pl : article.title;
          const contentText = locale === 'pl' && article.content_pl ? article.content_pl : article.content;
          const articleUrl = `/${locale}/gaming/${slug || article.id}`;
          return (
            <ArticleCard key={article.id} article={article} slug={slug ?? ""} title={titleText} content={contentText} articleUrl={articleUrl} locale={locale}/>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={currentPage > 1 ? `/${locale}/gaming?page=${currentPage - 1}` : undefined} 
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {pageNumbersToDisplay.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink 
                    href={`/${locale}/gaming?page=${page}`}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href={currentPage < totalPages ? `/${locale}/gaming?page=${currentPage + 1}` : undefined} 
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

export default async function GamingNewsPage({ 
  params, 
  searchParams 
}: { 
  params: { locale: string }, 
  searchParams?: { page?: string } 
}) {
  const { locale } = params;
  let currentPageToShow = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);

  const { data: latestArticleForExclusion, error: latestArticleError } = await supabase
    .from('gaming_articles')
    .select('id')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestArticleError) {
    console.error('Error fetching latest article ID for exclusion:', latestArticleError);
    const t = await getTranslations('GamingNewsPage'); 
    return <div className="container mx-auto px-4 py-8">{t('errorLoading')}</div>;
  }

  if (!latestArticleForExclusion) {
    const t = await getTranslations('GamingNewsPage');
    return (
      <div className=" px-4 py-8 pt-30 relative">
        <Image src={blossom} alt="blossom" className="absolute lg:right-[-140px] lg:top-[-100px] right-[-100px] top-[-50px] -z-10 lg:size-[500px] size-[300px]" />
        <Image src={blossom} alt="blossom" className="absolute lg:left-[-140px] lg:top-[-100px] left-[-100px] top-[-50px] rotate-180 -z-10 lg:size-[500px] size-[300px]" />
        <div className="flex items-center mb-8 space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl border px-4 py-2">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
        </div>
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">{t('noArticles')}</p>
        </div>
      </div>
    );
  }

  const featuredArticleIdToExclude = latestArticleForExclusion.id;

  return (
    <div className=" px-4 py-8 pt-30 relative">
      <Image src={blossom} alt="blossom" className="absolute lg:right-[-140px] lg:top-[-100px] right-[-100px] top-[-50px] -z-10 lg:size-[500px] size-[300px]" />
      <Image src={blossom} alt="blossom" className="absolute lg:left-[-140px] lg:top-[-100px] left-[-100px] top-[-50px] rotate-180 -z-10 lg:size-[500px] size-[300px]" />
      
      <FeaturedGamingArticleDisplay locale={locale} />

      <Suspense fallback={<div className="text-center py-10 text-xl">{await (async () => { const t = await getTranslations('GamingNewsPage'); return t('loadingArticles'); })()}</div>}>
        <PaginatedRegularArticles 
          locale={locale} 
          currentPage={currentPageToShow} 
          featuredArticleId={featuredArticleIdToExclude} 
        />
      </Suspense>
    </div>
  );
}