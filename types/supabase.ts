export interface Database {
  public: {
    Tables: {
      // This is a placeholder. You should generate the actual types
      // using the Supabase CLI and replace the content of this file.
      // Example command: 
      // npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
      gaming_articles: {
        Row: {
          id: number;
          title: string | null;
          content: string | null;
          title_pl: string | null;
          content_pl: string | null;
          url: string | null;
          source: string | null;
          published_at: string | null;
          slug_en: string | null; // Added based on previous discussions
          slug_pl: string | null; // Added based on previous discussions
          created_at: string | null;
          slug: string | null; // Original slug, ensure it's correctly handled or removed if redundant
        }; 
        Insert: {
          id?: number;
          title?: string | null;
          content?: string | null;
          title_pl?: string | null;
          content_pl?: string | null;
          url?: string | null;
          source?: string | null;
          published_at?: string | null;
          slug_en?: string | null;
          slug_pl?: string | null;
          created_at?: string | null;
          slug?: string | null;
        }; 
        Update: {
          id?: number;
          title?: string | null;
          content?: string | null;
          title_pl?: string | null;
          content_pl?: string | null;
          url?: string | null;
          source?: string | null;
          published_at?: string | null;
          slug_en?: string | null;
          slug_pl?: string | null;
          created_at?: string | null;
          slug?: string | null;
        }; 
      };
      // Define other tables here if they exist, e.g., news_articles
    };
    Views: {
      // Define views here if they exist
    };
    Functions: {
      // Define functions here if they exist
    };
  };
}
