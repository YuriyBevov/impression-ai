export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCost = (cost: number): string => {
  return cost.toFixed(2);
};

export const formatTokens = (tokens: number): string => {
  return tokens.toString();
};

export const formatDirection = (direction: string): string => {
  switch(direction.toLowerCase()) {
    case 'ru-en':
      return 'RU → EN';
    case 'en-ru':
      return 'EN → RU';
    default:
      return direction.toUpperCase();
  }
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};