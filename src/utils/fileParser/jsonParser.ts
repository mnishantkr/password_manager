
import { v4 as uuidv4 } from 'uuid';
import type { Credential } from '@/pages/Dashboard';
import { normalizeCredential } from './normalizeCredential';

export function parseJsonFile(content: string): Credential[] {
  try {
    const data = JSON.parse(content);
    
    // Handle common JSON formats
    if (Array.isArray(data)) {
      return data.map(item => normalizeCredential(item));
    }
    
    // Handle Google Password Manager format
    if (data.passwords && Array.isArray(data.passwords)) {
      return data.passwords.map((item: any) => ({
        id: uuidv4(),
        name: item.name || item.url || 'Unknown',
        url: item.url,
        username: item.username || item.email || '',
        password: item.password || '',
        totpSecret: item.totp || item.totpSecret || undefined,
        category: item.category || 'Imported',
        dateAdded: Date.now()
      }));
    }
    
    // Handle Bitwarden format
    if (data.items && Array.isArray(data.items)) {
      return data.items
        .filter((item: any) => item.type === 1) // Filter to only include logins
        .map((item: any) => ({
          id: uuidv4(),
          name: item.name || 'Unknown',
          url: item.login?.uris?.[0]?.uri || '',
          username: item.login?.username || '',
          password: item.login?.password || '',
          totpSecret: item.login?.totp || '',
          category: item.folderName || 'Imported',
          dateAdded: Date.now()
        }));
    }
    
    // Handle LastPass format
    if (data.accounts && Array.isArray(data.accounts)) {
      return data.accounts.map((item: any) => ({
        id: uuidv4(),
        name: item.name || item.url || 'Unknown',
        url: item.url,
        username: item.username || '',
        password: item.password || '',
        totpSecret: '',
        category: item.group || 'Imported',
        dateAdded: Date.now()
      }));
    }
    
    // If we couldn't match a specific format, but we have objects with username/password
    if (typeof data === 'object' && data !== null) {
      const credentials: Credential[] = [];
      
      // Try to extract credentials from nested objects
      function extractCredentials(obj: any, path = '') {
        if (typeof obj !== 'object' || obj === null) return;
        
        if (obj.username || obj.user || obj.email || obj.password) {
          credentials.push(normalizeCredential(obj, path));
          return;
        }
        
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            extractCredentials(obj[key], path ? `${path} - ${key}` : key);
          }
        }
      }
      
      extractCredentials(data);
      return credentials;
    }
    
    throw new Error('Unrecognized JSON format');
  } catch (error) {
    throw new Error(`Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
