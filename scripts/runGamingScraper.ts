// Load environment variables first
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Pobierz ścieżkę do katalogu zawierającego skrypt
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wczytaj zmienne środowiskowe z pliku .env w głównym katalogu projektu
const envPath = path.resolve(__dirname, '../.env');
console.log(`Ładowanie zmiennych środowiskowych z: ${envPath}`);
dotenv.config({ path: envPath });

// Log zmiennych środowiskowych do debugowania
console.log('Sprawdzam zmienne środowiskowe:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'BRAK');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'BRAK');

// Then import other modules
import { scrapeGamingArticles } from '../lib/gamingScraper.js';

console.log('Starting Gaming news scraper...');
scrapeGamingArticles();
