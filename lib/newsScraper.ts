import axios from 'axios';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ArticleData {
  title: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

const sources = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/tag/artificial-intelligence/',
    selector: 'a[href*="tag/artificial-intelligence"]',
    baseUrl: 'https://techcrunch.com'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/',
    selector: 'a[href*="ai/"]',
    baseUrl: 'https://venturebeat.com',
    isAbsolute: true
  }
];

async function scrapeArticle(url: string, source: string) {
  console.log(`\n📄 Przetwarzam artykuł: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });
    
    const $ = load(response.data);
    
    // Pobieranie tytułu i treści - dostosowane do różnych stron
    let title = $('h1').first().text().trim() || 
               $('meta[property="og:title"]').attr('content') || 
               $('title').text().trim();
    
    // Usuwanie niepotrzebnych elementów przed pobraniem treści
    $('script, style, nav, footer, iframe, noscript').remove();
    
    // Pobieranie treści z różnych możliwych selektorów
    let content = '';
    const contentSelectors = [
      'article', 
      'main', 
      '.post-content', 
      '.article-content',
      'div[itemprop="articleBody"]'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text().trim();
        console.log(`✅ Znaleziono treść używając selektora: ${selector}`);
        break;
      }
    }
    
    if (!content) {
      // Ostateczna próba - weź całą stronę i wyczyść ją
      content = $('body').text()
        .replace(/\s+/g, ' ')
        .replace(/<[^>]*>/g, ' ')
        .trim();
      console.log('⚠️  Używam całej zawartości strony jako treści');
    }
    
    if (!title || !content) {
      console.error('❌ Nie udało się wyodrębnić tytułu lub treści');
      return null;
    }
    
    console.log(`📝 Tytuł: ${title.substring(0, 50)}...`);
    console.log(`📝 Treść: ${content.substring(0, 100)}...`);
    
    const now = new Date().toISOString();
    const articleData: ArticleData = {
      title: title.substring(0, 10000), // Ogranicz długość tytułu
      content: content.substring(0, 100000), // Ogranicz długość treści
      url: url.substring(0, 1000), // Ogranicz długość URL
      source: source,
      published_at: now,
      created_at: now,
      updated_at: now
    };
    
    return articleData;
    
  } catch (error: any) {
    console.error(`❌ Błąd podczas przetwarzania artykułu ${url}:`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dane:`, error.response.data);
    } else if (error.request) {
      console.error('Brak odpowiedzi z serwera');
    } else {
      console.error('Błąd:', error.message);
    }
    return null;
  }
}

async function getExistingArticle(url: string) {
  console.log(`\n🔍 Sprawdzam czy artykuł już istnieje: ${url}`);
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('url', url)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.log('ℹ️ Artykuł nie istnieje w bazie, dodawanie...');
        return null;
      }
      console.error('❌ Błąd podczas sprawdzania artykułu:');
      console.error('Kod błędu:', error.code);
      console.error('Wiadomość:', error.message);
      if (error.details) console.error('Szczegóły:', error.details);
      throw error;
    }
    
    console.log('✅ Artykuł już istnieje w bazie, pomijam. ID:', data.id);
    return data;
  } catch (error: any) {
    console.error('❌ Nieoczekiwany błąd podczas sprawdzania artykułu:');
    console.error(error);
    throw error;
  }
}

async function saveArticle(articleData: ArticleData) {
  console.log(`\n💾 Próba zapisania artykułu: ${articleData.title?.substring(0, 50) || 'Brak tytułu'}...`);
  
  // Logowanie danych przed wysłaniem
  const articleForLog = {
    title: articleData.title?.substring(0, 30) + '...' || 'Brak',
    content: articleData.content?.substring(0, 30) + '...' || 'Brak',
    url: articleData.url || 'Brak URL',
    source: articleData.source || 'Brak źródła',
    published_at: articleData.published_at || 'Brak daty',
    title_length: articleData.title?.length || 0,
    content_length: articleData.content?.length || 0
  };
  
  console.log('=== DANE ARTYKUŁU PRZED WYSŁANIEM ===');
  console.log(JSON.stringify(articleForLog, null, 2));
  
  // Dodanie timestampów
  const now = new Date().toISOString();
  const articleToSave = {
    ...articleData,
    created_at: now,
    updated_at: now
  };
  
  console.log('\n=== DANE DO WYSŁANIA ===');
  console.log(JSON.stringify({
    ...articleForLog,
    created_at: now,
    updated_at: now
  }, null, 2));
  
  try {
    console.log('\n🚀 Wysyłanie zapytania do Supabase...');
    
    // Najpierw sprawdźmy połączenie z Supabase
    console.log('🔍 Sprawdzanie połączenia z Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('❌ Błąd połączenia z Supabase:', testError);
    } else {
      console.log('✅ Połączenie z Supabase działa poprawnie');
    }
    
    // Próba zapisania artykułu
    console.log('\n💽 Próba zapisania artykułu...');
    const { data, error, status, statusText } = await supabase
      .from('articles')
      .insert(articleToSave)
      .select();

    console.log('\n🔔 ODPOWIEDŹ Z SUPABASE ===');
    console.log('Status:', status, statusText);
    
    if (error) {
      console.error('❌ BŁĄD Z SUPABASE ===');
      console.error('Kod błędu:', error.code);
      console.error('Wiadomość:', error.message);
      console.error('Szczegóły:', error.details || 'Brak dodatkowych szczegółów');
      console.error('Podpowiedź:', error.hint || 'Brak podpowiedzi');
      
      if (error.code === '23505') {
        console.error('⚠️ Konflikt unikalności - artykuł o podanym URL już istnieje');
      }
      
      console.error('\nPełny obiekt błędu:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ OSTRZEŻENIE: Brak danych w odpowiedzi, ale nie zgłoszono błędu');
      console.log('Pełna odpowiedź:', JSON.stringify({ data, error, status, statusText }, null, 2));
    } else {
      console.log('✅ SUKCES: Artykuł zapisany pomyślnie');
      console.log('ID zapisanego rekordu:', data[0]?.id);
      console.log('Pełna odpowiedź:', JSON.stringify(data, null, 2));
    }
    
    return data;
    
  } catch (error: any) {
    console.error('\n❌ KRYTYCZNY BŁĄD ===');
    console.error('Nazwa błędu:', error.name);
    console.error('Komunikat:', error.message);
    
    if (error.code) console.error('Kod błędu:', error.code);
    if (error.stack) console.error('Stack trace:', error.stack);
    
    // Dodatkowe informacje o błędzie sieciowym
    if (error.isAxiosError) {
      console.error('Błąd Axios:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        responseData: error.response?.data
      });
    }
    
    // Sprawdźmy jeszcze raz połączenie z Supabase
    try {
      console.log('\n🔍 Sprawdzanie połączenia z Supabase po błędzie...');
      const { data: testData, error: testError } = await supabase
        .from('articles')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.error('❌ Błąd połączenia z Supabase:', testError);
      } else {
        console.log('✅ Połączenie z Supabase działa poprawnie');
      }
    } catch (testError) {
      console.error('❌ Nie udało się sprawdzić połączenia z Supabase:', testError);
    }
    
    throw error;
  }
}

export async function scrapeArticles() {
  for (const source of sources) {
    console.log(`\n=== Rozpoczynam scrapowanie z: ${source.name} (${source.url}) ===`);
    try {
      console.log(`\n🔍 Pobieram listę artykułów z: ${source.name}`);
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 10000
      });
      
      // Zapisz odpowiedź do pliku do debugowania
      // require('fs').writeFileSync(`debug_${source.name.replace(/\s+/g, '_')}.html`, response.data);
      
      const $ = load(response.data);
      const elements = $(source.selector);
      
      console.log('📄 Zawartość strony:', response.data.substring(0, 500) + '...'); // Pierwsze 500 znaków
      console.log(`🔍 Znalezione elementy (${elements.length}):`);
      elements.each((i, el) => {
        console.log(`  ${i + 1}.`, $(el).attr('href') || 'Brak URL');
      });
      
      console.log(`✅ Pobrano ${elements.length} artykułów do sprawdzenia`);
      
      if (elements.length === 0) {
        console.log('⚠️  Nie znaleziono artykułów. Możliwe, że strona wykryła bota lub zmieniła strukturę HTML.');
      }
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const url = $(element).attr('href');
        if (!url) continue;

        const articleData = await scrapeArticle(url, source.name);
        if (!articleData) continue;

        // Sprawdź czy artykuł już istnieje
        const existingArticle = await getExistingArticle(url);
        
        // Jeśli artykuł nie istnieje, zapisz go
        if (!existingArticle) {
          try {
            await saveArticle(articleData);
          } catch (error) {
            console.error(`Error saving article: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping ${source.name}: ${error}`);
    }
  }
}

// Run scraper every 6 hours
export function startScraper() {
  scrapeArticles();
  setInterval(scrapeArticles, 6 * 60 * 60 * 1000);
}
