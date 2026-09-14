import { Article } from './mockArticles';

const ARTICLES_API_URL = 'https://hn.algolia.com/api/v1/search_by_date?query=crypto&tags=story&hitsPerPage=20';

type ArticleHit = {
  objectID?: string;
  title?: string;
  story_title?: string;
  url?: string;
  author?: string;
  created_at?: string;
  story_text?: string;
};

const getCategory = (title: string): Article['category'] => {
  const value = title.toLowerCase();
  if (value.includes('bitcoin') || value.includes('btc')) return 'Bitcoin';
  if (value.includes('defi') || value.includes('finance') || value.includes('ethereum')) return 'DeFi';
  if (value.includes('security') || value.includes('hack') || value.includes('scam')) return 'Security';
  if (value.includes('analysis') || value.includes('market') || value.includes('price')) return 'Analysis';
  return 'Web3';
};

const getSource = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\\./, '');
  } catch {
    return 'Hacker News';
  }
};

const getPublishedLabel = (createdAt?: string) => {
  if (!createdAt) return 'Recently';
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const hours = Math.max(1, Math.floor(elapsed / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export const fetchArticles = async (): Promise<Article[]> => {
  const response = await fetch(ARTICLES_API_URL);
  if (!response.ok) throw new Error('Unable to load articles.');

  const payload = await response.json() as { hits?: ArticleHit[] };
  return (payload.hits || [])
    .map((hit, index) => {
      const title = hit.title || hit.story_title;
      if (!title || !hit.url) return null;
      const source = getSource(hit.url);
      return {
        id: `remote-${hit.objectID || index}`,
        title,
        category: getCategory(title),
        readTime: 'Open source',
        author: hit.author ? `Submitted by ${hit.author}` : 'Hacker News',
        source,
        sourceUrl: hit.url,
        publishedAt: getPublishedLabel(hit.created_at),
        imageBg: '#0EA5E9',
        summary: hit.story_text?.replace(/<[^>]+>/g, '').slice(0, 220) || `Open the original article published by ${source}.`,
        content: [
          `This link was discovered through Hacker News’ public API and points to ${source}.`,
          'Use the original-source link below to read the publisher’s complete, current article.',
        ],
      } as Article;
    })
    .filter((article): article is Article => article !== null);
};
