import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

// Pobierz ścieżkę do katalogu zawierającego skrypt
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bezwzględna ścieżka do pliku .env
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Sprawdzam plik .env pod ścieżką: ${envPath}`);

// Sprawdź czy plik istnieje
if (!existsSync(envPath)) {
  console.error(`❌ Błąd: Plik .env nie istnieje pod ścieżką: ${envPath}`);
  // Wyświetl zawartość katalogu dla debugowania
  console.log('\nZawartość katalogu głównego projektu:');
  try {
    const files = readFileSync(path.resolve(__dirname, '../../'), 'utf8');
    console.log(files);
  } catch (e) {
    console.error('Nie można odczytać zawartości katalogu:', e);
  }
  process.exit(1);
}

// Wczytaj zmienne środowiskowe
try {
  dotenv.config({ path: envPath });
  console.log('✅ Plik .env załadowany pomyślnie');
} catch (error) {
  console.error('❌ Błąd podczas wczytywania pliku .env:', error);
  process.exit(1);
}

// Ręcznie ustaw zmienne środowiskowe na potrzeby debugowania
const envVars = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NIE USTAWIONO',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'USTAWIONO' : 'NIE USTAWIONO'
};

console.log('\n=== ZMIENNE ŚRODOWISKOWE ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', envVars.supabaseUrl);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.supabaseKey);

// Sprawdź czy klucze są ustawione
if (envVars.supabaseUrl === 'NIE USTAWIONO' || !envVars.supabaseKey) {
  console.error('\n❌ Błąd: Brak wymaganych zmiennych środowiskowych');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Brak wymaganych zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL i/lub NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testDbConnection() {
  console.log('🔍 Testowanie połączenia z Supabase...');
  
  // Test 1: Pobierz jeden rekord z tabeli articles
  console.log('\n🔹 Test 1: Pobieranie istniejących rekordów...');
  const { data: existingData, error: selectError } = await supabase
    .from('articles')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('❌ Błąd podczas pobierania danych:');
    console.error(selectError);
  } else {
    console.log(`✅ Pobrano ${existingData?.length || 0} rekordów`);
    if (existingData && existingData.length > 0) {
      console.log('Przykładowy rekord:', JSON.stringify(existingData[0], null, 2));
    }
  }

  // Test 2: Wstaw nowy rekord
  console.log('\n🔹 Test 2: Próba wstawienia nowego rekordu...');
  const testArticle = {
    title: 'Testowy artykuł',
    content: 'To jest testowa treść artykułu',
    source: 'Testowe źródło',
    url: `https://example.com/test-${Date.now()}`,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('\n📝 Dane do wstawienia:');
  console.log(JSON.stringify(testArticle, null, 2));

  const { data: insertedData, error: insertError } = await supabase
    .from('articles')
    .insert(testArticle)
    .select();

  if (insertError) {
    console.error('❌ Błąd podczas wstawiania danych:');
    console.error(insertError);
    
    // Dodatkowe informacje o błędzie
    if ('code' in insertError) {
      console.error('\n📌 Kod błędu:', insertError.code);
      console.error('Wiadomość:', insertError.message);
      console.error('Szczegóły:', (insertError as any).details || 'Brak dodatkowych szczegółów');
      console.error('Podpowiedź:', (insertError as any).hint || 'Brak podpowiedzi');
    }
    
  } else {
    console.log('\n✅ Pomyślnie wstawiono nowy rekord!');
    console.log('ID nowego rekordu:', insertedData?.[0]?.id);
    console.log('Pełna odpowiedź:', JSON.stringify(insertedData, null, 2));
  }

  // Test 3: Sprawdź uprawnienia RLS
  console.log('\n🔹 Test 3: Sprawdzanie uprawnień RLS...');
  try {
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_enabled');
    
    if (rlsError) {
      console.log('Nie można bezpośrednio sprawdzić RLS, ale to normalne:', rlsError.message);
    } else {
      console.log('Status RLS:', rlsData);
    }
  } catch (e) {
    console.log('Błąd podczas sprawdzania RLS:', e);
  }
}

// Uruchom testy
testDbConnection()
  .then(() => {
    console.log('\n🏁 Zakończono testy');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Wystąpił nieoczekiwany błąd:');
    console.error(error);
    process.exit(1);
  });
