import type { CollectionType, QdrantCollection, KnowledgePoint } from '../types/qdrant';

export const getCollectionType = (name: string): CollectionType => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('glossary')) {
    return 'glossary';
  } else if (lowerName.includes('examples') || lowerName.includes('stylistics') || lowerName.includes('style')) {
    return 'example';
  } else if (lowerName.includes('client') || lowerName.includes('клиент')) {
    return 'client';
  } else {
    return 'unknown';
  }
};

export const normalizeCollections = (collections: any[]): QdrantCollection[] => {
  return (collections || [])
    .map((collection: any) => ({
      name: collection.name || collection.collection_name || '',
      pointsCount: collection.points_count ?? collection.pointsCount ?? collection.vectors_count ?? 0,
      type: getCollectionType(collection.name || collection.collection_name || '')
    }))
    .filter(item => item.name);
};

export const normalizePoints = (points: any[]): KnowledgePoint[] => {
  return points.map(point => {
    const p = point.payload || {};
    
    // Handle new pipeline format: { pageContent, metadata: { lang_1, lang_2, ... } }
    const meta = p.metadata || {};
    
    let source_term = '';
    let target_term = '';
    
    if (meta.lang_1 || meta.lang_2) {
      // New nested metadata format — prefer this
      source_term = meta.lang_1 || '';
      target_term = meta.lang_2 || '';
    } else {
      // Legacy flat format
      source_term = p.source_term || p.sourceTerm || p.text || '';
      target_term = p.target_term || p.targetTerm || p.targetText || '';
      
      // Fallback: parse from pageContent
      if (!target_term && p.pageContent) {
        const arrowMatch = p.pageContent.match(/=>\s*(.+)/);
        if (arrowMatch) {
          target_term = arrowMatch[1].trim();
          if (!source_term) {
            const beforeArrow = p.pageContent.split('=>')[0].trim();
            if (beforeArrow) source_term = beforeArrow;
          }
        } else {
          // Bilingual space-separated: try to split
          const parts = p.pageContent.split(' ');
          if (parts.length >= 2) {
            // Heuristic: first half EN, second half RU
            target_term = p.pageContent;
          }
        }
      }
    }

    return {
      id: typeof point.id === 'object' && point.id.hasOwnProperty('num')
        ? String(point.id.num)
        : String(point.id),
      payload: {
        source_term,
        target_term,
        context: meta.category || p.category || p.context || p.domain || p.description || '',
        note: meta.note || p.note || p.notes || '',
        tags: meta.tags || (Array.isArray(p.tags) ? p.tags : []),
        source_lang: p.source_lang || p.sourceLang || '',
        target_lang: p.target_lang || p.targetLang || '',
        client: meta.client || p.client || ''
      }
    };
  });
};