
import { createHmac } from 'crypto-js';
import Hex from 'crypto-js/enc-hex';
import WordArray from 'crypto-js/lib-typedarrays';

// Base32 decoder function since crypto-js doesn't have a direct import for it
function base32ToHex(base32: string) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  // Convert each Base32 character to its 5-bit value
  for (let i = 0; i < base32.length; i++) {
    const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
    if (val >= 0) {
      bits += val.toString(2).padStart(5, '0');
    }
  }

  // Convert 5-bit groups to 4-bit (hex) groups
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substring(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }

  return hex;
}

export function generateTOTP(secret: string): { token: string; secondsRemaining: number } {
  try {
    // Clean up the secret (remove spaces and convert to uppercase)
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    
    // Calculate the time counter (30-second intervals since Unix epoch)
    const timeCounter = Math.floor(Date.now() / 1000 / 30);
    
    // Calculate how many seconds remain in the current period
    const secondsElapsed = (Date.now() / 1000) % 30;
    const secondsRemaining = Math.ceil(30 - secondsElapsed);
    
    // Generate the TOTP
    const token = calculateTOTP(cleanSecret, timeCounter);
    
    return {
      token,
      secondsRemaining
    };
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return {
      token: 'Error',
      secondsRemaining: 30
    };
  }
}

function calculateTOTP(secret: string, counter: number): string {
  try {
    // Convert the counter to a byte array (8 bytes, big endian)
    const counterBytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = counter & 0xff;
      counter = counter >> 8;
    }
    
    // Convert counter to WordArray for CryptoJS
    const counterHex = Array.from(counterBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    const counterWordArray = Hex.parse(counterHex);
    
    // Decode the base32 secret
    let key;
    try {
      // Use our custom base32 decoder
      const hexKey = base32ToHex(secret);
      key = Hex.parse(hexKey);
    } catch (e) {
      // If not valid base32, try to use it directly (might be hex or raw)
      key = secret;
    }
    
    // Calculate the HMAC
    const hmac = createHmac('SHA1', key).update(counterWordArray).finalize();
    const hmacHex = hmac.toString(Hex);
    
    // Convert the HMAC to a byte array
    const hmacBytes = new Uint8Array(hmacHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Get the offset (last 4 bits of the HMAC)
    const offset = hmacBytes[19] & 0xf;
    
    // Get the 4 bytes at the offset
    const code =
      ((hmacBytes[offset] & 0x7f) << 24) |
      (hmacBytes[offset + 1] << 16) |
      (hmacBytes[offset + 2] << 8) |
      hmacBytes[offset + 3];
    
    // Get the numerical code and ensure it's 6 digits
    const codeString = (code % 1000000).toString();
    
    // Pad with leading zeros if necessary
    return codeString.padStart(6, '0');
  } catch (error) {
    console.error('Error in TOTP calculation:', error);
    return '------';
  }
}
