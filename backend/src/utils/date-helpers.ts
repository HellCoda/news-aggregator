// backend/src/utils/date-helpers.ts
export function toISOString(date: Date | string | undefined | null): string | null {
  if (!date) return null;
  
  if (typeof date === 'string') {
    // Si c'est déjà une string, vérifier si c'est une date valide
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? date : parsed.toISOString();
  }
  
  return date.toISOString();
}

export function toDate(value: any): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}