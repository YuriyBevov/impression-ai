export const required = (value: any): string | true => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'Обязательное поле';
  }
  return true;
};

export const isValidEmail = (value: string): string | true => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Некорректный email адрес';
  }
  return true;
};

export const minLength = (min: number) => (value: string): string | true => {
  if (!value || value.length < min) {
    return `Минимум ${min} символов`;
  }
  return true;
};