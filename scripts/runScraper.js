import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeArticles } from '../lib/newsScraper.js';

// Get the directory path containing the script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('Checking environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING');

// Run the scraper
console.log('Starting AI news scraper...');
scrapeArticles()
  .then(() => console.log('Scraping completed successfully'))
  .catch(error => {
    console.error('Error during scraping process:', error);
    process.exit(1);
  });