
import { parseJsonFile } from './jsonParser';
import { parseCsvFile } from './csvParser';
import { parseXmlFile } from './xmlParser';
import { normalizeCredential } from './normalizeCredential';
import type { Credential } from '@/pages/Dashboard';

export function parseImportedFile(
  content: string, 
  fileType: 'json' | 'csv' | 'xml'
): Credential[] {
  switch (fileType) {
    case 'json':
      return parseJsonFile(content);
    case 'csv':
      return parseCsvFile(content);
    case 'xml':
      return parseXmlFile(content);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export { normalizeCredential };
