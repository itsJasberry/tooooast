import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata: Metadata = {
  title: 'AI News | Latest Artificial Intelligence Developments',
  description: 'Stay updated with the latest AI news, developments, and breakthroughs from around the world.',
  keywords: 'AI news, artificial intelligence, machine learning, deep learning, AI developments, technology news',
  robots: 'index, follow',
  openGraph: {
    title: 'AI News | Latest Artificial Intelligence Developments',
    description: 'Stay updated with the latest AI news, developments, and breakthroughs from around the world.',
    url: '/news',
    type: 'website',
    locale: 'en_US',
  }
};

export default async function NewsPage() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching articles:', error);
    return <div className="container mx-auto px-4 py-8">Error loading news articles</div>;
  }

  return (
    <div className="mx-auto px-4 py-8 pt-30">
      <h1 className="text-4xl font-bold mb-8">Latest AI News</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {article.title}
              </a>
            </h2>
            <p className="text-gray-600 text-sm mb-4">{article.source}</p>
            <p className="line-clamp-3 mb-4">{article.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <Link
                href={article.url} 
                className="text-blue-600 hover:text-blue-800"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
