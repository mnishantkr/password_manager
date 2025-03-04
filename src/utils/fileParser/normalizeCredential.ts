
import { v4 as uuidv4 } from 'uuid';
import type { Credential } from '@/pages/Dashboard';

export function normalizeCredential(item: any, name?: string): Credential {
  return {
    id: uuidv4(),
    name: item.name || item.title || item.site || name || 'Unknown',
    url: item.url || item.website || item.site || item.uri || undefined,
    username: item.username || item.user || item.email || item.login || '',
    password: item.password || item.pass || item.pwd || '',
    totpSecret: item.totp || item.totpSecret || item.twoFactorSecret || undefined,
    category: item.category || item.group || item.folder || 'Imported',
    dateAdded: Date.now()
  };
}
