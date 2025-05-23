// Load environment variables first
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Pobierz ścieżkę do katalogu zawierającego skrypt
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wczytaj zmienne środowiskowe z pliku .env w głównym katalogu projektu
const envPath = path.resolve(__dirname, '../.env');
console.log(`Ładowanie zmiennych środowiskowych z: ${envPath}`);
dotenv.config({ path: envPath });

// Inicjalizacja klienta Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createGamingArticlesTable() {
  console.log('Sprawdzanie czy tabela gaming_articles istnieje...');
  
  // Próba odczytania danych z tabeli, aby sprawdzić czy istnieje
  const { error } = await supabase
    .from('gaming_articles')
    .select('*')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('Tabela gaming_articles nie istnieje. Tworzenie tabeli...');
    
    // Tworzenie tabeli gaming_articles
    const { error: createError } = await supabase.rpc('create_gaming_articles_table');
    
    if (createError) {
      console.error('Błąd podczas tworzenia tabeli gaming_articles:', createError);
      
      // Alternatywna metoda - użycie SQL bezpośrednio
      console.log('Próba utworzenia tabeli przy użyciu SQL bezpośrednio...');
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS gaming_articles (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT NOT NULL,
            url TEXT NOT NULL,
            published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            image_url TEXT,
            title_pl TEXT,
            content_pl TEXT,
            slug TEXT,
            UNIQUE(slug)
          );
          
          -- Create index on slug for faster lookups
          CREATE INDEX IF NOT EXISTS gaming_articles_slug_idx ON gaming_articles (slug);
        `
      });
      
      if (sqlError) {
        console.error('Błąd podczas tworzenia tabeli gaming_articles przy użyciu SQL:', sqlError);
        console.log('Musisz ręcznie utworzyć tabelę gaming_articles w panelu administracyjnym Supabase.');
        console.log(`
          Struktura tabeli gaming_articles:
          - id: serial primary key
          - title: text not null
          - content: text not null
          - source: text not null
          - url: text not null
          - published_at: timestamp with time zone (default: now())
          - created_at: timestamp with time zone (default: now())
          - updated_at: timestamp with time zone (default: now())
          - image_url: text
        `);
      } else {
        console.log('Tabela gaming_articles została utworzona pomyślnie!');
      }
    } else {
      console.log('Tabela gaming_articles została utworzona pomyślnie!');
    }
  } else if (error) {
    console.error('Błąd podczas sprawdzania tabeli gaming_articles:', error);
  } else {
    console.log('Tabela gaming_articles już istnieje!');
  }
}

createGamingArticlesTable()
  .then(() => console.log('Proces zakończony'))
  .catch((error) => console.error('Błąd:', error));
