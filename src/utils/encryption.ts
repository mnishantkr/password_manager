
import CryptoJS from 'crypto-js';

// Key derivation function to generate a secure key from the master password
export function deriveKey(password: string, salt: string = 'PassKeeperNexus'): string {
  // PBKDF2 with 10000 iterations and SHA-256 hash
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  }).toString();
}

// Encrypt data with AES-256
export function encrypt(data: any, key: string): string {
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataStr, key).toString();
}

// Decrypt data
export function decrypt(encryptedData: string, key: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Try to parse as JSON, return as string if it fails
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed. The key might be incorrect.');
  }
}

// Generate a random password
export function generatePassword(
  length: number = 16,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  
  if (chars.length === 0) {
    // Default to alphanumeric if nothing selected
    chars = uppercase + lowercase + numbers;
  }
  
  let password = '';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  
  return password;
}

// Hash a string (for the master password verification)
export function hashString(str: string): string {
  return CryptoJS.SHA256(str).toString();
}
