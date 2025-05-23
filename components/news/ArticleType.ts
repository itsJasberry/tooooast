export interface Article {
    id: number;
    title: string;
    content: string;
    url: string;
    source: string;
    published_at: string;
    image_url?: string;
    title_pl?: string;
    content_pl?: string;
    title_en?: string;
    content_en?: string;
    slug_en?: string;
    slug_pl?: string;
    category: string;
  }