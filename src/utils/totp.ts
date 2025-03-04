
import { createHmac } from 'crypto-js';
import Base32 from 'crypto-js/enc-base32';
import Hex from 'crypto-js/enc-hex';
import WordArray from 'crypto-js/lib-typedarrays';

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
      key = Base32.parse(secret);
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
