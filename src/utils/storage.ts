
import { encrypt, decrypt, deriveKey, hashString } from './encryption';
import type { Credential } from '@/pages/Dashboard';
import { v4 as uuidv4 } from 'uuid';

// LocalStorage keys
const STORAGE_KEYS = {
  MASTER_PASSWORD_HASH: 'passkeeper_master_password_hash',
  ENCRYPTION_TEST: 'passkeeper_encryption_test',
  CREDENTIALS: 'passkeeper_credentials',
  SETTINGS: 'passkeeper_settings'
};

// In-memory storage for the encryption key (cleared on page refresh)
let encryptionKey: string | null = null;

// Initialize storage with a new master password
export function initializeStorage(): void {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify([]));
}

// Set the master password
export function setMasterPassword(password: string): void {
  // Create a hash of the password for verification
  const passwordHash = hashString(password);
  localStorage.setItem(STORAGE_KEYS.MASTER_PASSWORD_HASH, passwordHash);
  
  // Generate encryption key and store in memory
  encryptionKey = deriveKey(password);
  
  // Store an encryption test to verify the key works
  const testValue = { test: 'This is a test value', timestamp: Date.now() };
  const encryptedTest = encrypt(testValue, encryptionKey);
  localStorage.setItem(STORAGE_KEYS.ENCRYPTION_TEST, encryptedTest);
  
  // Initialize empty credentials array
  saveCredentials([]);
}

// Validate the master password
export function validateMasterPassword(password: string): boolean {
  const storedHash = localStorage.getItem(STORAGE_KEYS.MASTER_PASSWORD_HASH);
  if (!storedHash) {
    throw new Error('No master password has been set up');
  }
  
  const passwordHash = hashString(password);
  if (passwordHash !== storedHash) {
    return false;
  }
  
  // Set the encryption key
  encryptionKey = deriveKey(password);
  
  // Verify the encryption key works by decrypting the test value
  try {
    const encryptedTest = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_TEST);
    if (encryptedTest) {
      decrypt(encryptedTest, encryptionKey);
    }
    return true;
  } catch (error) {
    encryptionKey = null;
    return false;
  }
}

// Check if the vault has been set up
export function isVaultSetup(): boolean {
  return localStorage.getItem(STORAGE_KEYS.MASTER_PASSWORD_HASH) !== null;
}

// Save credentials to storage
export function saveCredentials(credentials: Credential[]): void {
  if (!encryptionKey) {
    throw new Error('Encryption key not available. Please authenticate first.');
  }
  
  const encryptedData = encrypt(credentials, encryptionKey);
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, encryptedData);
}

// Get credentials from storage
export function getCredentials(): Credential[] {
  if (!encryptionKey) {
    throw new Error('Encryption key not available. Please authenticate first.');
  }
  
  const encryptedData = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  if (!encryptedData) {
    return [];
  }
  
  try {
    const decryptedData = decrypt(encryptedData, encryptionKey);
    return Array.isArray(decryptedData) ? decryptedData : [];
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return [];
  }
}

// Add a new credential
export function addCredential(credential: Omit<Credential, 'id' | 'dateAdded'>): Credential {
  const credentials = getCredentials();
  
  const newCredential: Credential = {
    ...credential,
    id: uuidv4(),
    dateAdded: Date.now()
  };
  
  credentials.push(newCredential);
  saveCredentials(credentials);
  
  return newCredential;
}

// Update an existing credential
export function updateCredential(id: string, updates: Partial<Credential>): boolean {
  const credentials = getCredentials();
  const index = credentials.findIndex(cred => cred.id === id);
  
  if (index === -1) {
    return false;
  }
  
  credentials[index] = { ...credentials[index], ...updates };
  saveCredentials(credentials);
  
  return true;
}

// Delete a credential
export function deleteCredential(id: string): boolean {
  const credentials = getCredentials();
  const filteredCredentials = credentials.filter(cred => cred.id !== id);
  
  if (filteredCredentials.length === credentials.length) {
    return false;
  }
  
  saveCredentials(filteredCredentials);
  return true;
}

// Lock the vault (clear the encryption key)
export function lockVault(): void {
  encryptionKey = null;
}
