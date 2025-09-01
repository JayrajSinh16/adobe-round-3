/**
 * Response data transformation utilities
 * Normalizes backend responses for consistent frontend consumption
 */
import { toStringSafe, toNumberSafe } from './validators';

export const transformConnection = (connection) => ({
  title: toStringSafe(connection?.title),
  type: toStringSafe(connection?.type),
  document: toStringSafe(connection?.document?.name ?? connection?.document),
  pages: transformPages(connection?.pages),
  snippet: toStringSafe(connection?.snippet),
  strength: toStringSafe(connection?.strength) || 'medium',
});

export const transformInsight = (insight) => ({
  type: toStringSafe(insight?.type),
  title: toStringSafe(insight?.title),
  content: toStringSafe(insight?.content),
  confidence: Number(insight?.confidence) || 0,
  source_documents: Array.isArray(insight?.source_documents) 
    ? insight.source_documents.map(transformSourceDocument)
    : [],
});

export const transformSourceDocument = (doc) => ({
  pdf_name: toStringSafe(doc?.pdf_name || doc?.document || doc?.name),
  pdf_id: toStringSafe(doc?.pdf_id || doc?.id),
  page: toNumberSafe(doc?.page, 1),
});

export const transformPages = (pages) => {
  if (Array.isArray(pages)) {
    return pages.filter(x => Number.isFinite(Number(x))).map(x => Number(x));
  }
  if (Number.isFinite(Number(pages))) {
    return [Number(pages)];
  }
  return [];
};

export const transformYouTubeVideo = (video) => ({
  id: video.id || video.videoId || '',
  url: video.url || (video.id ? `https://www.youtube.com/watch?v=${video.id}` : ''),
  title: video.title || 'Untitled',
  thumbnail: video.thumbnail || video.thumb || '',
  channelTitle: video.channelTitle || video.channel || '',
  publishedAt: video.publishedAt || video.date || '',
});

// Helper for podcast insight transformation
export const transformInsightForPodcast = (insight) => ({
  type: insight.type || 'key_takeaways',
  title: insight.title || 'Insight',
  content: insight.content || insight.insight || '',
  source_documents: Array.isArray(insight.source_documents) 
    ? insight.source_documents.map(doc => ({
        pdf_name: doc.pdf_name || doc.document || doc.name || 'Document',
        pdf_id: doc.pdf_id || doc.id || '',
        page: doc.page || 1,
      }))
    : [],
  confidence: Number(insight.confidence) || 0.8,
});
