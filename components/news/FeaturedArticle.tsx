import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { Article } from './ArticleType';
import { getFeaturedArticleGradientStyle } from '@/lib/getGradient';

interface FeaturedArticleProps {
  article: Article;
  locale: string;
  badgeVariant: string;
}


  
export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article, locale, badgeVariant }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { // Możesz zmienić 'en-US' na 'pl-PL' dla polskiego formatu daty
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const slug = locale === 'en' ? article.slug_en : article.slug_pl;
  const title = locale === 'pl' && article.title_pl ? article.title_pl : article.title;
  
  // Pobierz oryginalną treść
  let originalContent = locale === 'pl' && article.content_pl ? article.content_pl : article.content;

  // Funkcja do skracania tekstu
  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) {
      return ''; // Zwróć pusty ciąg, jeśli tekst jest undefined
    }
    if (text.length <= maxLength) {
      return text;
    }
    // Znajdź ostatnią spację w obrębie maxLength, aby nie ucinać słów w połowie
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    // Jeśli jest spacja i nie jest to jedyne słowo, utnij do ostatniej spacji
    if (lastSpaceIndex > 0 && lastSpaceIndex < maxLength - 3) { // -3 dla "..."
        return truncated.substring(0, lastSpaceIndex) + '...';
    }
    // W przeciwnym razie utnij "twardo" i dodaj wielokropek
    return truncated + '...';
  };

  // Skróć treść do wyświetlenia
  const displayedContent = truncateText(originalContent, 350);
  
  const articleUrl = `/${locale}/gaming/${slug || article.id}`;
  const backgroundStyle = getFeaturedArticleGradientStyle(badgeVariant);

  return (
    <article className="group relative rounded-xl overflow-hidden shadow-2xl border border-gray-700 mb-12">
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        {/* Tailwind v4 gradient syntax */}
        <div 
          className="absolute inset-0 transition-all duration-700 group-hover:scale-105 bg-linear-to-br from-purple-900 via-blue-900 to-gray-900"
        ></div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mb-4">
            <CategoryBadge category={article.category} size="large" />
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white leading-tight max-w-[1000px]">
            {title}
          </h2>
          
          <div className="flex items-center text-gray-300 mb-6">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatDate(article.published_at)}</span>
          </div>
          
          {/* Użyj skróconej treści */}
          <p className="text-gray-300 text-lg mb-6 max-w-3xl line-clamp-3 md:line-clamp-none">
            {displayedContent}
          </p>
          
          <a
            href={articleUrl}
            className="inline-flex items-center px-6 py-3 bg-[#333333] hover:bg-[#333333]/70 rounded-lg text-white font-medium transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#333333]/70"
          >
            Read Full Article
            <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </article>
  );
};