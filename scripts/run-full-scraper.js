import axios from 'axios';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import slugify from 'slugify'; // Standard ESM import
// -----------------------------------------------------------------------------
// Konfiguracja Zmiennych Środowiskowych (odczyt z GitHub Actions Secrets)
// -----------------------------------------------------------------------------
console.log('Odczytywanie zmiennych środowiskowych dla GitHub Actions...');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

console.log(`SUPABASE_URL: ${supabaseUrl ? 'OK' : 'BRAK!'}`);
console.log(`SUPABASE_ANON_KEY: ${supabaseKey ? 'OK' : 'BRAK!'}`);
console.log(`DEEPSEEK_API_KEY: ${deepseekApiKey ? 'OK' : 'BRAK (ostrzeżenie zostanie wygenerowane później, jeśli potrzebny)'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('BŁĄD KRYTYCZNY: Brak SUPABASE_URL lub SUPABASE_ANON_KEY w zmiennych środowiskowych!');
  console.error('Upewnij się, że są one ustawione jako sekrety (np. SUPABASE_URL, SUPABASE_ANON_KEY) w konfiguracji GitHub Actions dla tego repozytorium i przekazane w sekcji `env` workflow.');
  process.exit(1);
}

if (!deepseekApiKey) {
  console.warn('\n⚠️ UWAGA: Brak klucza DEEPSEEK_API_KEY. Zaawansowane przetwarzanie tekstu (parafraza, tłumaczenie, kategoryzacja AI) nie będzie działać lub będzie ograniczone!');
  console.warn('Jeśli te funkcje są wymagane, dodaj sekret DEEPSEEK_API_KEY w GitHub Actions i przekaż go jako zmienną środowiskową.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Pomyślnie zainicjowano klienta Supabase.');

// -----------------------------------------------------------------------------
// Definicje Typów i Stałych (z Twojego gamingScraper.ts)
// -----------------------------------------------------------------------------
const CATEGORIES = {
  GAME: 'Game',
  MOVIE: 'Movie',
  TV_SHOW: 'TV Show',
  COMIC: 'Comic',
  TECH: 'Tech',
  OTHER: 'Other',
};

const CATEGORY_KEYWORDS = {
    [CATEGORIES.GAME]: [
      // Ogólne i platformowe - wzmocnione
      'gra', 'game', 'gaming', 'gra wideo', 'video game', 'gamer', 'gracz', 'tytuł', 'release', 'premiera', 'gameplay', 'developer', 'wydawca', 'publisher',
      'rpg', 'fps', 'strategia', 'strategy', 'symulator', 'simulator', 'przygodowa', 'adventure', 'akcji', 'action', 'sportowa', 'sports', 'wyścigowa', 'racing', 'logiczna', 'puzzle', 'platformowa', 'platformer', 'indie game', 'gra niezależna', 'gra akcji', 'gra fabularna', 'gra strategiczna',
      'playstation', 'ps5', 'ps4', 'ps3', 'ps2', 'ps1', 'sony', 'dualshock', 'dualsense', 'ps vr', 'konsola sony',
      'xbox', 'microsoft', 'series x', 'series s', 'one', '360', 'game pass', 'kinect', 'konsola xbox',
      'nintendo', 'switch', 'wii', 'wii u', 'ds', '3ds', 'mario', 'zelda', 'pokemon', 'joy-con', 'konsola nintendo',
      'pc', 'steam', 'epic games', 'origin', 'ubisoft connect', 'gog', 'komputer gamingowy', 'gaming pc',
      'mobile', 'mobilna', 'android', 'ios', 'smartfon', 'tablet', 'gra mobilna', 'mobile game', 'app store', 'google play', 'gra na telefon',
      'esport', 'e-sport', 'turniej', 'tournament', 'zawody', 'competition', 'gracz profesjonalny', 'pro player', 'iem', 'esl', 'dreamhack', 'liga', 'mistrzostwa',
      'gry', 'games', 'rozrywka cyfrowa', 'digital entertainment', 'świat gier', 'branża gier',
      // Dodane konkretne tytuły gier i terminy z przykładów
      'fortnite', 'minecraft', 'capcom fighting collection', 'capcom', 'Capcom', 'fighting collection', 'collection 2', // Dodane warianty
      'world of warcraft', 'league of legends', 'cs:go', 'dota 2', 'valorant', 'starcraft', 'overwatch', 'fifa', 'cyberpunk 2077', 'wiedźmin', 'the witcher', 'grand theft auto', 'gta', 'call of duty', 'assassin\'s creed', 'elden ring', 'horizon forbidden west',
      'silnik gry', 'game engine', 'patch', 'aktualizacja', 'update', 'dodatek', 'dlc', 'ekspansja', 'expansion', 'sezon', 'season', 'przepustka bojowa', 'battle pass',
      'mechanika gry', 'game mechanics', 'tryb gry', 'game mode', 'wielu graczy', 'multiplayer', 'singleplayer', 'kampania', 'campaign', 'fabuła', 'story',
      'przetrwanie', 'survival', 'budowanie', 'building', 'świat gry', 'game world', 'mapa', 'map', 'poziom', 'level'
    ],
    [CATEGORIES.MOVIE]: [
      'film', 'kino', 'movie', 'cinema', 'reżyser', 'director', 'aktor', 'aktorka', 'actor', 'actress', 'premiera kinowa', 'theatrical release', 'box office', 'produkcja filmowa', 'film production', 'seans', 'screening', 'gatunek filmowy', 'movie genre',
      // Dodane terminy związane z filmem i serialem, które mogą pojawić się w crossoverach
      'star wars', 'gwiezdne wojny', 'darth vader', 'imperium', 'rebelia', 'jedi', 'sith', 'saga', 'trylogia', 'disney', 'lucasfilm',
      'marvel cinematic universe', 'mcu', 'dc extended universe', 'dceu', 'superbohater', 'superhero', 'komiksowy', 'based on comic' // Dopasowanie do filmów/seriali na podstawie komiksów
    ],
    [CATEGORIES.TV_SHOW]: [
      'serial', 'tv show', 'netflix', 'hbo', 'disney+', 'amazon prime', 'sezon', 'season', 'odcinek', 'episode', 'streaming', 'platforma streamingowa', 'streaming platform', 'produkcja telewizyjna', 'tv production', 'serial telewizyjny',
      // Dodane terminy związane z serialem, które mogą pojawić się w crossoverach
      'star wars', 'gwiezdne wojny', 'darth vader', 'mandolorian', 'andor', 'ahsoka',
      'serial animowany', 'animated series', 'serial dokumentalny', 'documentary series', 'serial komediowy', 'comedy series', 'serial dramatyczny', 'drama series'
    ],
    [CATEGORIES.COMIC]: [
      'komiks', 'comic', 'marvel', 'dc', 'image comics', 'dark horse', 'manga', 'graphic novel', 'wydawnictwo komiksowe', 'comic book publisher', 'postać komiksowa', 'comic character', 'rysownik', 'scenarzysta', 'artist', 'writer', 'superbohater', 'superhero', 'powieść graficzna',
      'wydanie', 'zeszyt', 'tom', 'seria komiksowa', 'comic series', 'album komiksowy', 'manga', 'shonen', 'shojo', 'seinen', 'josei',
      // Dodane terminy, które mogą pojawić się w kontekście komiksów
      'historia obrazkowa', 'sztuka komiksu', 'kolekcja komiksów'
    ],
    [CATEGORIES.TECH]: [
      // Rozszerzone o szersze terminy techniczne, mniej specyficzne dla gier (choć overlap jest)
      'technologia', 'technology', 'tech', 'gadżet', 'gadget', 'innowacje', 'innovation', 'przyszłość technologii', 'future of tech',
      'hardware', 'sprzęt', 'software', 'oprogramowanie', 'system', 'aplikacja', 'app', 'program', 'narzędzie', 'tool',
      'komputer', 'computer', 'laptop', 'desktop', 'serwer', 'server', 'centrum danych', 'data center',
      'procesor', 'processor', 'cpu', 'karta graficzna', 'graphics card', 'gpu', 'ram', 'pamięć ram', 'dysk ssd', 'ssd', 'dysk hdd', 'hdd', 'płyta główna', 'motherboard', 'zasilacz', 'power supply', 'chłodzenie', 'cooling',
      'internet', 'sieć', 'network', 'wi-fi', '5g', '6g', 'lte', 'światłowód', 'fiber', 'połączenie', 'connection', 'pasmo', 'bandwidth', 'router', 'modem',
      'system operacyjny', 'operating system', 'windows', 'macos', 'linux', 'android', 'ios',
      'ai', 'sztuczna inteligencja', 'artificial intelligence', 'uczenie maszynowe', 'machine learning', 'głębokie uczenie', 'deep learning', 'sieci neuronowe', 'neural networks', 'przetwarzanie języka naturalnego', 'nlp',
      'vr', 'rzeczywistość wirtualna', 'virtual reality', 'ar', 'rzeczywistość rozszerzona', 'augmented reality', 'xr', 'mixed reality',
      'it', 'informatyka', 'cyberbezpieczeństwo', 'cybersecurity', 'dane', 'data', 'big data', 'analiza danych', 'data analysis',
      'chmura', 'cloud', 'przetwarzanie w chmurze', 'cloud computing', 'usługi chmurowe', 'cloud services',
      'elektronika', 'electronics', 'urządzenie', 'device', 'smart home', 'inteligentny dom', 'noszone technologie', 'wearable tech', 'internet rzeczy', 'iot', 'czujnik', 'sensor',
      'programowanie', 'programming', 'development', 'developer', 'kod', 'code', 'język programowania', 'programming language', 'framework', 'biblioteka', 'library', 'algorytm', 'algorithm',
      'robotyka', 'robotics', 'automatyka', 'automation', 'druk 3d', '3d printing',
      'blockchain', 'kryptowaluty', 'cryptocurrency', 'nft', 'token', 'web3',
      'cyfrowy', 'digital', 'transformacja cyfrowa', 'digital transformation', 'prywatność', 'privacy', 'bezpieczeństwo', 'security', 'infrastruktura', 'infrastructure'
    ],
    [CATEGORIES.OTHER]: ['inne', 'other', 'pozostałe'] // Dodałem 'pozostałe'
  };


// -----------------------------------------------------------------------------
// Funkcje Pomocnicze (z Twojego gamingScraper.ts)
// -----------------------------------------------------------------------------

async function getCategory(title, content){
    try {
      const combinedText = `${title.toLowerCase()} ${content.toLowerCase()}`;
      
      // Najpierw sprawdź kategorie, które mają priorytet
      const priorityCategories = [
        CATEGORIES.GAME, // Główna kategoria dla treści gamingowych
        CATEGORIES.MOVIE,
        CATEGORIES.TV_SHOW,
        CATEGORIES.COMIC
      ];
  
      // Najpierw sprawdź czy to na pewno nie jest treść gamingowa
      const isGamingContent = CATEGORY_KEYWORDS[CATEGORIES.GAME].some(keyword => {
        const keywordLower = keyword.toLowerCase();
        // Sprawdź czy słowo kluczowe występuje w kontekście gamingowym
        if (combinedText.includes(keywordLower)) {
          // Sprawdź czy to nie jest fałszywy pozytyw (np. "film o graczach")
          const context = combinedText.substring(
            Math.max(0, combinedText.indexOf(keywordLower) - 30),
            Math.min(combinedText.length, combinedText.indexOf(keywordLower) + keywordLower.length + 30)
          );
          
          // Wyklucz typowe fałszywe pozytywy
          const falsePositives = ['film', 'movie', 'serial', 'show', 'comic', 'komiks'];
          if (falsePositives.some(fp => context.includes(fp))) {
            return false;
          }
          return true;
        }
        return false;
      });
  
      if (isGamingContent) {
        console.log(`🎮 Zidentyfikowano treść gamingową na podstawie słów kluczowych`);
        return CATEGORIES.GAME;
      }
  
      // Sprawdź inne kategorie z priorytetem
      for (const category of priorityCategories.filter(c => c !== CATEGORIES.GAME)) {
        if (CATEGORY_KEYWORDS[category].some((keyword) => 
          combinedText.includes(keyword.toLowerCase())
        )) {
          console.log(`📽️ Zidentyfikowano kategorię ${category} na podstawie słów kluczowych`);
          return category;
        }
      }
  
      // Sprawdź pozostałe kategorie
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (priorityCategories.includes(category)) {
          continue;
        }
        
        if (keywords.some(keyword => 
          combinedText.includes(keyword.toLowerCase())
        )) {
          console.log(`🏷️ Zidentyfikowano kategorię ${category} na podstawie słów kluczowych`);
          return category;
        }
      }
  
      // Jeśli nie możemy jednoznacznie określić kategorii, użyj DeepSeek
      if (deepseekApiKey) {
        try {
          console.log('🤖 Używam DeepSeek do określenia kategorii...');
          const response = await axios.post(
            'https://api.deepseek.com/chat/completions',
            {
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: `Zaklasyfikuj poniższy artykuł do jednej z kategorii: ${Object.values(CATEGORIES).join(', ')}. 
                  Odpowiedz tylko nazwą kategorii, nic więcej.`
                },
                {
                  role: 'user',
                  content: `Tytuł: ${title}\n\n${content.substring(0, 1000)}...`
                }
              ],
              temperature: 0.3,
              max_tokens: 50
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
              },
              timeout: 10000 // 10 sekund timeout
            }
          );
  
          const aiCategory = response.data.choices[0]?.message?.content?.trim();
          
          if (aiCategory) {
            console.log(`🤖 DeepSeek zasugerował kategorię: ${aiCategory}`);
            
            // Sprawdź czy odpowiedź to poprawna kategoria  
            const validCategories = Object.values(CATEGORIES);
            if (validCategories.includes(aiCategory)) {
              return aiCategory;
            }
          }
        } catch (error) {
          console.error('❌ Błąd podczas korzystania z DeepSeek do kategoryzacji:', error);
          // Kontynuuj do domyślnej kategorii
        }
      }
  
      // Domyślna kategoria
      return CATEGORIES.OTHER;
    } catch (error) {
      console.error('❌ Błąd podczas określania kategorii:', error);
      return CATEGORIES.OTHER;
    }
  }
  

  async function paraphraseAndFormatEnglishWithDeepSeek(
    title,
    content
  ) {
    if (!deepseekApiKey) {
      console.error('❌ DEEPSEEK_API_KEY is not set in environment variables.');
      return null;
    }
  
    const maxLength = 12000;
    const trimmedContent = content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  
    const prompt = `
      You are a professional copywriter and editor specializing in gaming articles.
      Your task is to paraphrase and reformat the following English article title and content to make it highly engaging and well-structured.
  
      TITLE PARAPHRASING RULES:
      - Create a completely new title that captures the essence but uses different words and structure
      - Use synonyms and different sentence structures
      - Change the voice (active/passive) if possible
      - Consider different angles or perspectives
      - Keep it concise (under 80 characters)
      - Make it attention-grabbing and click-worthy
      - The new title should be significantly different from the original
      
      Examples:
      Original: "New Zelda Game Announced for Nintendo Switch"
      Good: "Nintendo Unveils Latest Zelda Adventure for Switch"
      
      Original: "Call of Duty Breaks Sales Records"
      Good: "Record-Breaking Launch for Latest Call of Duty Title"
  
      YOUR MAIN TASKS:
      1. Create a completely new, unique title following the rules above
      2. Paraphrase the content to be more engaging and dynamic, avoiding overly literal restatement.
      3. Focus on the most important information. Paraphrase to be engaging, but try to retain all significant details from the original article.
  
      TEXT FORMATTING RULES:
      1. Divide the text into short, readable paragraphs (2-4 sentences each).
      2. Use indentations and paragraphs to improve readability.
      3. Add 3-5 relevant emojis throughout the text to liven it up.
      4. Use subheadings if the article discusses different aspects of the topic (enclose subheadings in asterisks, e.g., *New Features*).
      5. You can highlight the most important information by adding an emoji at the beginning of the sentence. 
      6. Conclude the article with a brief summary or conclusion.
      7. For lists, use hyphens as list markers.
      8. Ensure the text is coherent and logical, with sentences flowing smoothly.
      9. Omit any reader comments, links to other articles, or website interface elements.
  
      Example of well-formatted output (note the title format):
      
      Cosmic Odyssey: Next-Gen Space Exploration Awaits
      
      The new game 'Cosmic Adventure' hits the market next month! Players will explore vast galaxies full of undiscovered planets.
  
      *Innovative Gameplay*
  
      The game developers have implemented a brand-new combat system, combining strategy elements with dynamic action. Controlling your spaceship has never been so intuitive.
  
      During gameplay, you'll be able to:
      - Discover new planets
      - Make contact with alien civilizations
      - Participate in epic space battles
      
      [Note: The rest of the article continues with the same format as before...]
  
      Original Title: ${title}
  
      Original Content: ${trimmedContent}
    `;
  
    try {
      console.log('📝 Paraphrasing English article using DeepSeek API...');
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekApiKey}`,
          },
        }
      );
  
      const resultText = response.data.choices[0].message.content;
      const titleMatch = resultText.match(/Title: (.*)/);
      const newTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : title;
  
      let newContent = resultText;
      if (titleMatch) {
        newContent = newContent.replace(titleMatch[0], '').trim();
      }
  
      if (!newContent.includes(trimmedContent.substring(0,50)) && resultText.length > 100) {
          const lines = resultText.split('\n');
          if (lines.length > 2 && lines[1].trim() === '') { 
              newContent = lines.slice(2).join('\n').trim();
          } else {
              newContent = resultText.substring(resultText.indexOf("\n\n") + 2).trim(); 
              if (!newContent || newContent.length < 50) newContent = resultText;
          }
      }
  
      console.log('✅ English article paraphrased and formatted.');
      return { title: newTitle, content: newContent };
  
    } catch (error) {
      console.error('❌ Error paraphrasing English article with DeepSeek:', error.response?.data || error.message);
      return null;
    }
  }
  
  async function translateAndParaphraseToPolishWithDeepSeek(
    title,
    content
  ) {
    if (!deepseekApiKey) {
      console.error('❌ DEEPSEEK_API_KEY is not set in environment variables.');
      return null;
    }
  
    const maxLength = 12000;
    const trimmedContent = content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  
    try {
      console.log('\n🔎 Tłumaczenie artykułu za pomocą DeepSeek API...');
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { 
              role: 'system', 
              content: 'Jesteś profesjonalnym tłumaczem i redaktorem specjalizującym się w tekstach gamingowych. Twoim zadaniem jest przetłumaczenie i sformatowanie tekstu na język polski.' 
            },
            { 
              role: 'user', 
              content: `Przetłumacz na język polski i sformatuj następujący artykuł, zachowując znaczenie i styl:
              
  Tytuł: ${title}
  
  Treść: ${trimmedContent}
  
  Zwróć odpowiedź w formacie JSON:
  {
    "title_pl": "Przetłumaczony tytuł",
    "content_pl": "Przetłumaczona i sformatowana treść"
  }`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekApiKey}`
          }
        }
      );
  
      const responseText = response.data.choices[0].message.content;
      console.log('✅ Otrzymano odpowiedź z DeepSeek API');
      
      // Usuń ewentualne znaki nowej linii i białe znaki z początku i końca
      let cleanedResponse = responseText.trim();
      
      // Usuń otaczające markdown code block (```json i ```)
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1');
      
      console.log('Oczyszczona odpowiedź:', cleanedResponse.substring(0, 100) + '...');
  
      try {
        // Spróbuj sparsować odpowiedź jako JSON
        const result = JSON.parse(cleanedResponse);
        return {
          title: result.title_pl,
          content: result.content_pl
        };
      } catch (parseError) {
        console.error('Błąd parsowania odpowiedzi JSON z DeepSeek:', parseError);
        console.error('Pełna odpowiedź:', cleanedResponse);
        
        // Jeśli nie udało się sparsować JSON, spróbuj wyciągnąć tytuł i treść z odpowiedzi
        const titleMatch = cleanedResponse.match(/"title_pl":\s*"([^"]+)"/i) || 
                          cleanedResponse.match(/Tytuł:\s*([^\n]+)/i);
        const contentMatch = cleanedResponse.match(/"content_pl":\s*"([\s\S]*?)"(?=,\s*"|}$)/i) || 
                            cleanedResponse.match(/Treść:\s*([\s\S]*)/i);
        
        if (titleMatch && contentMatch) {
          return {
            title: titleMatch[1].trim(),
            content: contentMatch[1].trim()
          };
        }
        
        // Jeśli nadal nie udało się wyciągnąć danych, zwróć oryginalny tekst
        console.warn('Nie udało się wyodrębnić przetłumaczonej treści, zwracam oryginał');
        return {
          title: title,
          content: content
        };
      }
    } catch (error) {
      console.error('❌ Błąd podczas tłumaczenia z DeepSeek API:', error);
      return null;
    }
  }
  
  async function getExistingGamingArticle(url) {
    console.log(`\n🔍 Sprawdzam czy artykuł gaming już istnieje: ${url}`);
    try {
      const { data, error } = await supabase
        .from('gaming_articles')
        .select('*')
        .eq('url', url)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          console.log('ℹ️ Artykuł gaming nie istnieje w bazie, dodawanie...');
          return null;
        }
        console.error('❌ Błąd podczas sprawdzania artykułu gaming:');
        console.error('Kod błędu:', error.code);
        console.error('Wiadomość:', error.message);
        console.error('Szczegóły:', error.details || 'Brak dodatkowych szczegółów');
        
        throw error;
      }
      
      console.log('✅ Artykuł gaming już istnieje w bazie, pomijam. ID:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Nieoczekiwany błąd podczas sprawdzania artykułu gaming:');
      console.error(error);
      throw error;
    }
  }
  
  async function saveGamingArticle(
    articleData
  ) {
    const { title_length, content_length, ...insertData } = articleData;
    console.log(`
  💾 Zapisuję artykuł do bazy danych: ${insertData.title}`);
    console.log(`   Kategoria: ${insertData.category}`);
    // Logika dodająca articleData do bazy Supabase
    // Upewnij się, że tabela 'gaming_articles' ma kolumnę 'category'
    const { data, error } = await supabase
      .from('gaming_articles')
      .insert([insertData]);
  
    if (error) {
      console.error('❌ Błąd podczas zapisu artykułu gamingowego do Supabase:', error.message);
      console.error('Szczegóły błędu:', error.details);
      console.error('Dane artykułu:', insertData);
      // Dodatkowe logowanie specyficzne dla błędów Supabase
      if (error.code) console.error('Kod błędu Supabase:', error.code);
      if (error.hint) console.error('Podpowiedź Supabase:', error.hint);
      throw error;
    }
  
    console.log('✅ Artykuł gamingowy zapisany pomyślnie:', data);
    return data;
  }
  

  async function scrapeGamingArticle(url, source) {
    console.log(`
  🔗 Scrapuję artykuł: ${url} ze źródła: ${source}`);
    
    try {
      console.log(`\n📄 Przetwarzam artykuł gaming: ${url}`);
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      const $ = load(html);
  
      let title = '';
      let content = '';
      let published_at = undefined;
  
      // Próba znalezienia tytułu
      const titleSelectors = [
        'h1.entry-title',
        'h1.title',
        'h1.post-title',
        'h1.article-title',
        'h1.story-title',
        'header h1',
        'h1',
        'meta[property="og:title"]',
        'title'
      ];
  
      for (const selector of titleSelectors) {
        if (selector === 'meta[property="og:title"]') {
          title = $(selector).attr('content')?.trim() || '';
        } else if (selector === 'title') {
          title = $(selector).text()?.trim() || '';
        } else {
          title = $(selector).first().text()?.trim() || '';
        }
        if (title) break;
      }
  
      // Próba znalezienia treści
      const contentSelectors = [
        'div.article-content',
        'div.entry-content',
        'div.post-content',
        'div.story-content',
        'article .content',
        'div.content',
        'article',
        'section.content-main'
      ];
      
      for (const selector of contentSelectors) {
        content = $(selector).first().text()?.trim() || '';
        if (content) break;
      }
  
      if (!title || !content) {
        console.warn('⚠️ Nie udało się pobrać tytułu lub treści. Możliwe, że strona ma inną strukturę HTML lub blokuje dostęp.');
        if (!title) console.log('Tytuł pusty.');
        if (!content) console.log('Treść pusta.');
        return null;
      }
  
  
  
      // Określanie kategorii
      const category = await getCategory(title, content);
  
      // Parafraza i formatowanie angielskiej wersji
      console.log('\n🔄 Rozpoczynam parafrazę i formatowanie angielskiej wersji...');
      const paraphrasedEnglish = await paraphraseAndFormatEnglishWithDeepSeek(title, content);
      if (!paraphrasedEnglish || !paraphrasedEnglish.title || !paraphrasedEnglish.content) {
        console.error('❌ Nie udało się sparafrazować angielskiej wersji.');
        return null;
      }
      const finalTitleEn = (paraphrasedEnglish.title); 
      const finalContentEn = (paraphrasedEnglish.content); 
  
      // Tłumaczenie i parafraza na polski
      console.log('\n🔄 Rozpoczynam tłumaczenie i parafrazę na język polski...');
      const translatedPolish = await translateAndParaphraseToPolishWithDeepSeek(paraphrasedEnglish.title, paraphrasedEnglish.content);
      if (!translatedPolish || !translatedPolish.title || !translatedPolish.content) {
        console.error('❌ Nie udało się przetłumaczyć na polski.');
        return null;
      }
      const finalTitlePl = (translatedPolish.title); 
      const finalContentPl = (translatedPolish.content); 
  
      // Próba znalezienia daty publikacji
      const dateSelectors = [
        'meta[property="article:published_time"]', 
        'time[itemprop="datePublished"]',
        'span.date',
        'div.published-date',
        'p.date-info'
      ];
  
      for (const selector of dateSelectors) {
        let dateStr = '';
        if (selector.startsWith('meta')) {
          dateStr = $(selector).attr('content') || '';
        } else {
          dateStr = $(selector).first().text().trim();
          if (!dateStr) {
             dateStr = $(selector).first().attr('datetime') || '';
          }
        }
  
        if (dateStr) {
          try {
            // Próba konwersji na standardowy format ISO, jeśli to możliwe
            // date-fns może mieć problemy z niektórymi formatami, więc potrzebna jest ostrożność
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              published_at = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"); // Format ISO 8601
              break;
            }
          } catch (e) {
            console.warn(`⚠️ Nie udało się sparsować daty: ${dateStr} za pomocą new Date(). Błąd: ${e}`);
          }
        }
      }
  
      if (!published_at) {
        console.warn('⚠️ Nie udało się znaleźć daty publikacji, ustawiam bieżącą datę.');
        published_at = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
      }
  
      // Generowanie slugów
      const slug_en = slugify(finalTitleEn, { lower: true, strict: true });
      const slug_pl = slugify(finalTitlePl, { lower: true, strict: true });
  
      console.log(`
  ✅ Artykuł scrapowany pomyślnie:
    Tytuł EN: ${finalTitleEn}
    Tytuł PL: ${finalTitlePl}
    Kategoria: ${category}
    URL: ${url}
    Źródło: ${source}
    Data publikacji: ${published_at}
  `);
  
      return {
        title: finalTitleEn,
        content: finalContentEn,
        source,
        url,
        published_at,
        title_pl: finalTitlePl,
        content_pl: finalContentPl,
        slug_en,
        slug_pl,
        category, // Dodano kategorię
      };
    } catch (error) {
      console.error(`❌ Błąd podczas przetwarzania artykułu ${url}:`);
      if (typeof error === 'object' && error !== null) {
        // Attempt to access properties as if it might be an Axios-like error or standard Error
        const errorAsObject = error;
  
        if (errorAsObject.response && typeof errorAsObject.response.status === 'number') {
          console.error(`Status: ${errorAsObject.response.status}`);
        } else if (errorAsObject.request) {
          console.error('Brak odpowiedzi z serwera');
        } else if (error instanceof Error) { // Standard Error instance
          console.error('Błąd:', error.message);
        } else if (typeof errorAsObject.message === 'string') { // Object with a message property
          console.error('Błąd (wiadomość obiektu):', errorAsObject.message);
        } else {
          console.error('Nieznany błąd obiektu:', error); // Log the object itself if no specific properties found
        }
      } else if (typeof error === 'string') { // Handle if a string was thrown
          console.error('Błąd (string):', error);
      } else {
        // For other primitive types or if it's not an object or string
        console.error('Nieznany typ błędu:', String(error));
      }
      return null;
    }
  }
// -----------------------------------------------------------------------------
// Główna Funkcja Orchestrująca
// -----------------------------------------------------------------------------
export async function scrapeGamingArticles() {
  console.log('\n======================================================================================');
  console.log(`🚀 ROZPOCZYNAM SCRAPOWANIE ARTYKUŁÓW GAMING (GitHub Actions) o ${new Date().toISOString()}`);
  console.log('======================================================================================\n');

  const sources = [
    {
      name: 'GameSpot',
      url: 'https://www.gamespot.com/news/',
      selector: 'a.card-item__link, article.card-item a[href*="/articles/"]', // Keep existing, add more specific
      baseUrl: 'https://www.gamespot.com',
      isAbsolute: false
    },
    {
      name: 'PC Gamer',
      url: 'https://www.pcgamer.com/news/',
      selector: 'a.article-link, article.article-feature a.article-link', // Selectors for PC Gamer
      baseUrl: 'https://www.pcgamer.com',
      isAbsolute: false // URLs can be relative 
    },
    {
      name: 'IGN',
      url: 'https://www.ign.com/news',
      selector: 'a[class*="item-body"], a[class*="content-item"], article div > a[href*="/articles/"]', // Updated selectors
      baseUrl: 'https://www.ign.com',
      isAbsolute: true // IGN links are usually absolute from their news page
    },
   
  ];

  let totalNewArticlesSavedOverall = 0;

  for (const source of sources) {
    console.log(`\n-------------------------------------------------------------------`);
    console.log(`[Source Loop] 🔎 Przetwarzam źródło: ${source.name} (${source.url})`);
    console.log(`-------------------------------------------------------------------\n`);
    try {
      console.log(`[Source Loop] Pobieram listę artykułów z ${source.name}...`);
      const response = await axios.get(source.url, {
        headers: { // Przykładowe nagłówki, dostosuj w razie potrzeby
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
        },
        timeout: 30000 // 30 sekund na pobranie listy artykułów
      });
      const $ = load(response.data);
      const elements = $(source.selector);
      console.log(`[Source Loop] Znaleziono ${elements.length} potencjalnych linków dla ${source.name}. Próbuję przetworzyć do 5 nowych.`);

      if (elements.length === 0) {
        console.log(`[Source Loop] 🚫 Nie znaleziono żadnych linków dla ${source.name} używając selektora: "${source.selector}" na stronie ${source.url}`);
        continue; // Przejdź do następnego źródła
      }

      let articlesSavedFromThisSource = 0;
      for (let i = 0; i < elements.length; i++) {
        if (articlesSavedFromThisSource >= 5) {
          console.log(`[Source Loop] ✅ Osiągnięto limit 5 nowych artykułów dla źródła ${source.name}. Przechodzę do następnego elementu lub źródła.`);
          break; // Przerwij pętlę dla tego źródła, jeśli już zapisano 5
        }

        const element = $(elements[i]);
        let articlePathOrUrl = element.attr('href');

        if (!articlePathOrUrl) {
          console.log(`[Source Loop]\t⚠️ Brak atrybutu href dla elementu ${i+1} z ${source.name}, pomijam.`);
          continue;
        }
        articlePathOrUrl = articlePathOrUrl.trim();

        // ================================================================
        // POCZĄTEK POPRAWIONEJ LOGIKI BUDOWANIA URL
        // ================================================================
        let fullArticleUrl;
        try {
          if (articlePathOrUrl.startsWith('http://') || articlePathOrUrl.startsWith('https://')) {
            fullArticleUrl = articlePathOrUrl; // Już jest pełnym URL-em
          } else if (source.isAbsolute) {
            // Dla isAbsolute, linki są albo pełne (obsłużone wyżej) albo względne do baseUrl
            // `new URL` poprawnie obsłuży przypadki jak '/path/to/article' oraz 'path/to/article' względem baseUrl
            fullArticleUrl = new URL(articlePathOrUrl, source.baseUrl).toString();
          } else {
            // Dla isAbsolute: false, linki są względne do strony, na której się znajdują (source.url)
            fullArticleUrl = new URL(articlePathOrUrl, source.url).toString();
          }
        } catch (e) {
          console.warn(`[Source Loop]\t⚠️ Nie udało się skonstruować poprawnego URL dla "${articlePathOrUrl}" ze źródła ${source.name} (baseUrl: ${source.baseUrl}, sourceUrl: ${source.url}). Błąd: ${e.message}. Pomijam.`);
          continue; // Pomiń ten link, jeśli URL jest nieprawidłowy
        }
        // ================================================================
        // KONIEC POPRAWIONEJ LOGIKI BUDOWANIA URL
        // ================================================================

        console.log(`\n[Source Loop]\t🔗 [${i+1}/${elements.length}] Kandydat na URL: ${fullArticleUrl}`);

        // Sprawdź, czy artykuł już istnieje ZANIM zaczniesz go przetwarzać
        const existing = await getExistingGamingArticle(fullArticleUrl);
        if (existing) {
          // Nie zwiększamy licznika articlesSavedFromThisSource, bo nie jest to nowy, zapisany artykuł
          // Po prostu przechodzimy do następnego linku z listy
          continue;
        }

        // Jeśli artykuł nie istnieje, przetwarzamy go
        // Funkcja scrapeGamingArticle (dla pojedynczego artykułu) powinna zwracać null, jeśli coś pójdzie nie tak
        const articleData = await scrapeGamingArticle(fullArticleUrl, source.name);

        if (articleData) {
          try {
            await saveGamingArticle(articleData);
            articlesSavedFromThisSource++; // Zwiększ licznik tylko jeśli artykuł został pomyślnie przetworzony I ZAPISANY
            totalNewArticlesSavedOverall++;
          } catch(saveError) {
            // Błąd zapisu został już zalogowany w saveGamingArticle, ale można dodać kontekst
            console.error(`[Source Loop]\t🔥 Nie udało się zapisać przetworzonego artykułu ${fullArticleUrl} z powodu błędu: ${saveError.message}. Kontynuuję z następnym.`)
            // Nie zwiększamy articlesSavedFromThisSource, bo zapis się nie udał
          }
        } else {
          console.log(`[Source Loop]\t⚠️ Nie udało się w pełni przetworzyć (lub funkcja scrapeGamingArticle zwróciła null) dla artykułu: ${fullArticleUrl}. Kontynuuję z następnym.`);
          // Nie zwiększamy articlesSavedFromThisSource
        }
      } // Koniec pętli po elementach (linkach) dla danego źródła
      console.log(`\n[Source Loop] 📰 Zakończono przetwarzanie źródła ${source.name}. Zapisano ${articlesSavedFromThisSource} nowych artykułów z tego źródła.`);

    } catch (error) {
      console.error(`[Source Loop] ❌ KRYTYCZNY BŁĄD podczas pobierania listy lub głównej iteracji po źródle ${source.name}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.status, error.response?.data?.toString().substring(0,200));
      }
      // Kontynuuj z następnym źródłem, nawet jeśli jedno zawiedzie
    }
  } // Koniec pętli po wszystkich źródłach

  console.log('\n======================================================================================');
  console.log(`🎉 ZAKOŃCZONO CAŁE SCRAPOWANIE. Zapisano łącznie ${totalNewArticlesSavedOverall} nowych artykułów.`);
  console.log(`Czas zakończenia: ${new Date().toISOString()}`);
  console.log('======================================================================================\n');
}
// -----------------------------------------------------------------------------
// Punkt Wejścia Skryptu - uruchamia główną funkcję
// -----------------------------------------------------------------------------
console.log('Uruchamianie skryptu run-full-scraper.js...');
scrapeGamingArticles()
  .then(() => {
    console.log('✅ Skrypt scrapera zakończył działanie pomyślnie.');
    process.exit(0); // Zakończ z kodem sukcesu
  })
  .catch((error) => {
    console.error('❌🔥 KRYTYCZNY BŁĄD na najwyższym poziomie działania skryptu scrapera:', error);
    process.exit(1); // Zakończ z kodem błędu
  });