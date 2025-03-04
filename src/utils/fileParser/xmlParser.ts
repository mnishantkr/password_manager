import { v4 as uuidv4 } from 'uuid';
import type { Credential } from '@/pages/Dashboard';

export function parseXmlFile(content: string): Credential[] {
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
