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
    
    // Parse source_term: try new keys first, then text
    let source_term = p.source_term || p.sourceTerm || p.text || '';
    
    // Parse target_term: try new keys first, then pageContent (may contain "source => target" or just target)
    let target_term = p.target_term || p.targetTerm || p.targetText || '';
    if (!target_term && p.pageContent) {
      // pageContent may contain "source => target" format or just the target
      const arrowMatch = p.pageContent.match(/=>\s*(.+)/);
      if (arrowMatch) {
        target_term = arrowMatch[1].trim();
        // If source_term is empty, extract it from before the arrow
        if (!source_term) {
          const beforeArrow = p.pageContent.split('=>')[0].trim();
          if (beforeArrow) source_term = beforeArrow;
        }
      } else {
        target_term = p.pageContent;
      }
    }

    return {
      id: typeof point.id === 'object' && point.id.hasOwnProperty('num')
        ? String(point.id.num)
        : String(point.id),
      payload: {
        source_term,
        target_term,
        context: p.category || p.context || p.domain || p.description || '',
        note: p.note || p.notes || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        source_lang: p.source_lang || p.sourceLang || '',
        target_lang: p.target_lang || p.targetLang || '',
        client: p.client || ''
      }
    };
  });
};