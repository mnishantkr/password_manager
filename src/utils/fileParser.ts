import { v4 as uuidv4 } from 'uuid';
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

function parseJsonFile(content: string): Credential[] {
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

function parseCsvFile(content: string): Credential[] {
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

function parseXmlFile(content: string): Credential[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    const credentials: Credential[] = [];
    
    // Handle KeePass XML format
    const entries = xmlDoc.querySelectorAll('Entry');
    if (entries.length > 0) {
      Array.from(entries).forEach(entry => {
        let name = '';
        let username = '';
        let password = '';
        let url = '';
        let category = 'Imported';
        
        const strings = entry.querySelectorAll('String');
        Array.from(strings).forEach(string => {
          const keyElem = string.querySelector('Key');
          const valueElem = string.querySelector('Value');
          
          if (keyElem && valueElem) {
            const key = keyElem.textContent;
            const value = valueElem.textContent;
            
            if (key === 'Title') name = value || '';
            if (key === 'UserName') username = value || '';
            if (key === 'Password') password = value || '';
            if (key === 'URL') url = value || '';
          }
        });
        
        // Get group/category from parent group
        let groupNode = entry.parentNode;
        while (groupNode && groupNode.nodeName === 'Group') {
          const nameElem = groupNode.querySelector('Name');
          if (nameElem && nameElem.textContent) {
            category = nameElem.textContent;
            break;
          }
          groupNode = groupNode.parentNode;
        }
        
        if (username || password) {
          credentials.push({
            id: uuidv4(),
            name: name || url || 'Unknown',
            url: url || undefined,
            username,
            password,
            category,
            dateAdded: Date.now()
          });
        }
      });
      
      return credentials;
    }
    
    // If we couldn't identify a specific format, try generic extraction
    const genericCredentials = extractCredentialsFromXML(xmlDoc);
    if (genericCredentials.length > 0) {
      return genericCredentials;
    }
    
    throw new Error('Unrecognized XML format or no credentials found');
  } catch (error) {
    throw new Error(`Failed to parse XML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractCredentialsFromXML(xmlDoc: Document): Credential[] {
  const credentials: Credential[] = [];
  
  // Find elements that might contain login information
  const potentialContainers = xmlDoc.querySelectorAll('*');
  
  Array.from(potentialContainers).forEach(container => {
    const hasUserAttr = Array.from(container.attributes).some(attr => 
      attr.name.toLowerCase().includes('user') || attr.name.toLowerCase().includes('email')
    );
    
    const hasPassAttr = Array.from(container.attributes).some(attr => 
      attr.name.toLowerCase().includes('pass')
    );
    
    if (hasUserAttr && hasPassAttr) {
      const username = Array.from(container.attributes)
        .find(attr => attr.name.toLowerCase().includes('user') || attr.name.toLowerCase().includes('email'))?.value || '';
      
      const password = Array.from(container.attributes)
        .find(attr => attr.name.toLowerCase().includes('pass'))?.value || '';
      
      const url = Array.from(container.attributes)
        .find(attr => attr.name.toLowerCase().includes('url') || attr.name.toLowerCase().includes('site'))?.value;
      
      credentials.push({
        id: uuidv4(),
        name: container.nodeName || url || 'Unknown',
        url,
        username,
        password,
        category: 'Imported',
        dateAdded: Date.now()
      });
    }
  });
  
  return credentials;
}

function normalizeCredential(item: any, name?: string): Credential {
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
