import React from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import type { Article } from './ArticleType'; // Ensure ArticleType is correctly defined

// Import all necessary functions from your utility fileytryrty
import { 
  getFeaturedArticleGradientStyle, 
  getCategoryTextColorClasses, 
  getBadgeVariant, 
  getCategoryHoverTextColorClass
} from '@/lib/getGradient'; // Adjust path if needed
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article;
  slug: string; // Retained for context, though articleUrl is used for the link
  title: string;
  content: string;
  articleUrl: string; // Use this for the link href
  locale: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, title, content, articleUrl, locale }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US', { // Using locale for date format
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 1. Get the simplified category variant (e.g., 'green', 'blue')
  const categoryVariant = getBadgeVariant(article.category);

  // 2. Get the dynamic text color classes for the "Read more" link
  const linkTextColorClasses = getCategoryTextColorClasses(categoryVariant);
  // Klasa dla koloru tekstu tytułu PO NAJECHANIU na grupę (np. "text-purple-300")
  const titleHoverClass = getCategoryHoverTextColorClass(categoryVariant);
  return (
    <article className="group flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-purple-900/20 hover:-translate-y-1">
      {/* Card Header: Apply dynamic gradient background */}
      <div
        className="h-32 p-4 relative overflow-hidden" // Base classes for the header
        style={getFeaturedArticleGradientStyle(categoryVariant)} // Apply dynamic background style
      >
        <div className="absolute top-4 left-4">
          {/* CategoryBadge might also benefit from using categoryVariant if it accepts it */}
          <CategoryBadge category={article.category} />
        </div>
        {/* Overlay for text protection, adjust opacity if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow"> {/* Content area */}
        <h2 className={cn(
  `text-xl font-bold mb-3 line-clamp-2 transition-colors duration-200 text-white`, // Bazowe klasy
  `group-hover:${titleHoverClass}` // Poprawnie sformatowana dynamiczna klasa dla group-hover
)}>
          {title}
        </h2>
        
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatDate(article.published_at)}</span>
        </div>
        
        <div className="prose prose-sm prose-invert max-w-none text-gray-300 mb-4 line-clamp-3 flex-grow">
          {/* Assuming content is plain text. If it's Markdown, use <ReactMarkdown>{content}</ReactMarkdown> */}
          {content}
        </div>
        
        <div className="pt-4 mt-auto border-t border-gray-700/80"> {/* Footer with "Read more" link */}
          <Link
            href={articleUrl} // Use the directly passed articleUrl
            className={`inline-flex items-center font-medium text-sm transition-colors duration-200 ${linkTextColorClasses}`} // Apply dynamic text color
          >
            {locale === 'pl' ? 'Czytaj więcej' : 'Read more'}
            <ArrowUpRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </article>
  );
};