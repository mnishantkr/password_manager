
import { v4 as uuidv4 } from 'uuid';
import type { Credential } from '@/pages/Dashboard';

export function parseCsvFile(content: string): Credential[] {
  try {
    // Simple CSV parser
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain a header row and at least one data row');
    }
    
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Check if the file has the required columns
    const nameIndex = header.findIndex(h => h.includes('name') || h.includes('title') || h.includes('site'));
    const urlIndex = header.findIndex(h => h.includes('url') || h.includes('website') || h.includes('site'));
    const userIndex = header.findIndex(h => h.includes('user') || h.includes('email') || h.includes('login'));
    const passIndex = header.findIndex(h => h.includes('pass') || h.includes('password'));
    
    if (userIndex === -1 || passIndex === -1) {
      throw new Error('CSV file must contain username/email and password columns');
    }
    
    const getTotpIndex = header.findIndex(h => h.includes('totp') || h.includes('2fa') || h.includes('two-factor'));
    const getCategoryIndex = header.findIndex(h => h.includes('category') || h.includes('group') || h.includes('folder'));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      
      // Use URL as name if name is not available
      const name = nameIndex !== -1 ? values[nameIndex] : (urlIndex !== -1 ? values[urlIndex] : 'Unknown');
      
      return {
        id: uuidv4(),
        name,
        url: urlIndex !== -1 ? values[urlIndex] : undefined,
        username: values[userIndex],
        password: values[passIndex],
        totpSecret: getTotpIndex !== -1 ? values[getTotpIndex] : undefined,
        category: getCategoryIndex !== -1 ? values[getCategoryIndex] : 'Imported',
        dateAdded: Date.now()
      };
    });
    
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
