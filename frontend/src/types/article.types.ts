// Interface pour l'API (snake_case)
export interface ArticleAPI {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  url: string;
  author?: string;
  published_date?: string;
  source_id: number;
  source?: {
    id: number;
    name: string;
    url: string;
    category?: {
      id: number;
      name: string;
      color: string;
    };
  };
  is_read: boolean;
  is_favorite: boolean;
  is_archived?: boolean;
  read_at?: string;
  favorited_at?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  excerpt?: string;
  description?: string;
}

// Interface pour le frontend (camelCase)
export interface Article {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  url: string;
  author?: string;
  publishedDate?: string;
  sourceId: number;
  source?: {
    id: number;
    name: string;
    url: string;
    category?: {
      id: number;
      name: string;
      color: string;
    };
  };
  isRead: boolean;
  isFavorite: boolean;
  isArchived?: boolean;
  readAt?: string;
  favoritedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  excerpt?: string;
  description?: string;
}

// Fonction de transformation API -> Frontend
export function transformArticle(apiArticle: ArticleAPI | Article): Article {
  // Si l'objet est déjà en camelCase (format Article), on le retourne directement
  if ('imageUrl' in apiArticle && 'isRead' in apiArticle) {
    return apiArticle as Article;
  }
  
  // Sinon on transforme depuis le format API (snake_case)
  return {
    id: apiArticle.id,
    title: apiArticle.title,
    content: apiArticle.content,
    summary: apiArticle.summary,
    url: apiArticle.url,
    author: apiArticle.author,
    publishedDate: (apiArticle as ArticleAPI).published_date,
    sourceId: (apiArticle as ArticleAPI).source_id,
    source: apiArticle.source,
    isRead: (apiArticle as ArticleAPI).is_read,
    isFavorite: (apiArticle as ArticleAPI).is_favorite,
    isArchived: (apiArticle as ArticleAPI).is_archived,
    readAt: (apiArticle as ArticleAPI).read_at,
    favoritedAt: (apiArticle as ArticleAPI).favorited_at,
    createdAt: (apiArticle as ArticleAPI).created_at,
    updatedAt: (apiArticle as ArticleAPI).updated_at,
    imageUrl: (apiArticle as ArticleAPI).image_url,
    excerpt: apiArticle.excerpt,
    description: apiArticle.description,
  };
}

// Fonction de transformation Frontend -> API
export function transformArticleToAPI(article: Partial<Article>): Partial<ArticleAPI> {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    summary: article.summary,
    url: article.url,
    author: article.author,
    published_date: article.publishedDate,
    source_id: article.sourceId,
    is_read: article.isRead,
    is_favorite: article.isFavorite,
    is_archived: article.isArchived,
    image_url: article.imageUrl,
    excerpt: article.excerpt,
    description: article.description,
  };
}

export interface SavedArticle {
  id?: number;
  original_article_id?: number;
  title: string;
  content?: string;
  summary?: string;
  url: string;
  author?: string;
  published_date?: string;
  source_name: string;
  source_url?: string;
  category_name?: string;
  category_id?: number;
  saved_at?: string;
  notes?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}
