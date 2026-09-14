export interface Article {
  id: string;
  title: string;
  category: 'Bitcoin' | 'DeFi' | 'Web3' | 'Security' | 'Analysis';
  readTime: string;
  author: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  summary: string;
  imageBg: string;
  content: string[];
  trending?: boolean;
}

// Articles are loaded at runtime from the public source in articleApi.ts. Do not add
// editorial fallbacks here: unverified crypto and financial claims must not ship.
export const MOCK_ARTICLES: Article[] = [];
