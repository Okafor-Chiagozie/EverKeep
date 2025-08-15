import CryptoJS from 'crypto-js';

/**
 * Simple encryption utility using deterministic key generation
 * No keys need to be stored - they're generated from user/vault data
 */

export class EncryptionUtils {
  
  /**
   * Generate a deterministic key from user ID and vault ID
   */
  private static generateKey(userId: string, vaultId: string, purpose: 'content' | 'share' = 'content'): string {
    // Create a deterministic key using PBKDF2
    const salt = `everkeep-${purpose}-${vaultId}`;
    const key = CryptoJS.PBKDF2(userId, salt, {
      keySize: 256/32, // 256 bits
      iterations: 1000
    });
    return key.toString();
  }

  /**
   * Encrypt text content (messages)
   */
  static encryptText(text: string, userId: string, vaultId: string): string {
    try {
      console.log(`🔒 Encrypting text for user ${userId}, vault ${vaultId}:`, {
        textLength: text.length,
        textPreview: text.substring(0, 50)
      });
      
      const key = this.generateKey(userId, vaultId, 'content');
      const encrypted = CryptoJS.AES.encrypt(text, key).toString();
      
      console.log(`✅ Encryption successful:`, {
        encryptedLength: encrypted.length,
        encryptedPreview: encrypted.substring(0, 50)
      });
      
      return encrypted;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt content');
    }
  }

  /**
   * Decrypt text content (messages) - Enhanced with debugging
   */
  static decryptText(encryptedText: string, userId: string, vaultId: string): string {
    try {
      console.log(`🔓 Decrypting text for user ${userId}, vault ${vaultId}:`, {
        encryptedLength: encryptedText.length,
        encryptedPreview: encryptedText.substring(0, 50),
        isEncryptedFormat: this.isEncrypted(encryptedText)
      });
      
      const key = this.generateKey(userId, vaultId, 'content');
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) {
        console.error('❌ Decryption produced empty result');
        throw new Error('Invalid decryption result - empty string');
      }
      
      console.log(`✅ Decryption successful:`, {
        originalLength: originalText.length,
        originalPreview: originalText.substring(0, 50)
      });
      
      return originalText;
    } catch (error) {
      console.error('❌ Decryption failed:', error, {
        encryptedText: encryptedText.substring(0, 100),
        userId,
        vaultId
      });
      throw new Error('Failed to decrypt content');
    }
  }

  /**
   * Encrypt media metadata (Cloudinary URLs, filenames, etc.)
   */
  static encryptMediaData(mediaData: any, userId: string, vaultId: string): string {
    try {
      const jsonString = JSON.stringify(mediaData);
      console.log(`🔒 Encrypting media data:`, {
        dataKeys: Object.keys(mediaData),
        jsonLength: jsonString.length
      });
      
      return this.encryptText(jsonString, userId, vaultId);
    } catch (error) {
      console.error('❌ Media encryption failed:', error);
      throw new Error('Failed to encrypt media data');
    }
  }

  /**
   * Decrypt media metadata
   */
  static decryptMediaData(encryptedData: string, userId: string, vaultId: string): any {
    try {
      console.log(`🔓 Decrypting media data:`, {
        encryptedLength: encryptedData.length
      });
      
      const decryptedJson = this.decryptText(encryptedData, userId, vaultId);
      const parsed = JSON.parse(decryptedJson);
      
      console.log(`✅ Media decryption successful:`, {
        dataKeys: Object.keys(parsed)
      });
      
      return parsed;
    } catch (error) {
      console.error('❌ Media decryption failed:', error);
      throw new Error('Failed to decrypt media data');
    }
  }

  /**
   * Generate a shareable link token
   */
  static generateShareToken(userId: string, vaultId: string): string {
    try {
      const shareKey = this.generateKey(userId, vaultId, 'share');
      const timestamp = Date.now().toString();
      const payload = JSON.stringify({ vaultId, timestamp, userId });
      
      // Encrypt the payload with the share key
      const encrypted = CryptoJS.AES.encrypt(payload, shareKey).toString();
      
      // Base64 encode for URL safety
      return btoa(encrypted).replace(/[+/=]/g, (char) => {
        switch (char) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '';
          default: return char;
        }
      });
    } catch (error) {
      console.error('❌ Share token generation failed:', error);
      throw new Error('Failed to generate share token');
    }
  }

  /**
   * Verify and decode a share token
   */
  static verifyShareToken(token: string): { vaultId: string; userId: string } | null {
    try {
      // Decode from URL-safe base64
      const base64 = token.replace(/[-_]/g, (char) => char === '-' ? '+' : '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const encrypted = atob(padded);
      
      // We need to try different possible user/vault combinations
      // In a real implementation, you might store a hint or use a different approach
      // For now, we'll return the encrypted data and let the caller handle it
      return { vaultId: '', userId: '', encrypted } as any;
    } catch (error) {
      console.error('❌ Share token verification failed:', error);
      return null;
    }
  }

  /**
   * Decrypt content using share token (simplified approach)
   */
  static decryptWithShareToken(encryptedContent: string, userId: string, vaultId: string): string {
    try {
      // For simplicity, we'll use the same key generation
      // In production, you might want a separate share key system
      const shareKey = this.generateKey(userId, vaultId, 'share');
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, shareKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('❌ Share decryption failed:', error);
      throw new Error('Failed to decrypt shared content');
    }
  }

  /**
   * Check if content is encrypted (simple check)
   */
  static isEncrypted(content: string): boolean {
   if (!content) return false;
   
   console.log('🔍 Checking if content is encrypted:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 50),
      startsWithSaltedX: content.startsWith('U2FsdGVkX1'),
      containsSaltedX: content.includes('U2FsdGVkX1')
   });
   
   // 🔥 MAIN CHECK: CryptoJS AES encryption starts with "U2FsdGVkX1" when base64 encoded
   if (content.startsWith('U2FsdGVkX1')) {
      console.log('✅ Content is encrypted (starts with U2FsdGVkX1)');
      return true;
   }
   
   // Secondary check: if it contains the CryptoJS signature anywhere
   if (content.includes('U2FsdGVkX1')) {
      console.log('✅ Content is encrypted (contains U2FsdGVkX1)');
      return true;
   }
   
   // Additional checks for other patterns
   const isBase64Like = /^[A-Za-z0-9+/=]+$/.test(content);
   const isLongEnough = content.length > 50;
   
   // More sophisticated check: try to parse as JSON first
   try {
      const parsed = JSON.parse(content);
      // If it parses as JSON and has expected fields, it's probably not encrypted
      if (parsed && typeof parsed === 'object' && (parsed.cloudinaryUrl || parsed.filename)) {
         console.log('❌ Content is JSON with expected fields, not encrypted');
         return false;
      }
   } catch {
      // Not valid JSON, continue with other checks
   }
   
   // If it's very long and base64-like but doesn't have CryptoJS signature, 
   // it might be encrypted with a different method
   if (isBase64Like && isLongEnough) {
      console.log('⚠️ Content might be encrypted (base64-like and long)');
      return true;
   }
   
   console.log('❌ Content is not encrypted');
   return false;
   }

   /**
    * Enhanced safe decrypt with better error handling
    */
   static safeDecrypt(content: string, userId: string, vaultId: string): string {
   if (!content) {
      console.log('🔍 Empty content, returning as-is');
      return content;
   }
   
   console.log(`🔍 Safe decrypt check:`, {
      contentLength: content.length,
      contentPreview: content.substring(0, 100),
      isEncrypted: this.isEncrypted(content)
   });
   
   // Check if content looks like JSON (media data)
   try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
         // If it has Cloudinary URL, it's already decrypted media metadata
         if (parsed.cloudinaryUrl || parsed.filename) {
         console.log('📁 Content is media metadata (already decrypted)');
         return content;
         }
      }
   } catch {
      // Not JSON, continue with encryption check
   }
   
   if (!this.isEncrypted(content)) {
      console.log('📝 Content appears to be plain text');
      return content; // Return as-is if not encrypted
   }
   
   try {
      const decrypted = this.decryptText(content, userId, vaultId);
      console.log('✅ Successfully decrypted content:', {
         originalLength: content.length,
         decryptedLength: decrypted.length,
         decryptedPreview: decrypted.substring(0, 50)
      });
      return decrypted;
   } catch (error) {
      console.warn('⚠️ Failed to decrypt content, returning original:', error);
      return content; // Fallback to original content
   }
   }

  /**
   * Test encryption/decryption cycle
   */
  static testEncryptionCycle(text: string, userId: string, vaultId: string): boolean {
    try {
      console.log('🧪 Testing encryption cycle...');
      
      // Encrypt
      const encrypted = this.encryptText(text, userId, vaultId);
      console.log(`1. Encrypted: ${encrypted.substring(0, 50)}...`);
      
      // Decrypt
      const decrypted = this.decryptText(encrypted, userId, vaultId);
      console.log(`2. Decrypted: ${decrypted}`);
      
      // Compare
      const matches = text === decrypted;
      console.log(`3. Test ${matches ? 'PASSED' : 'FAILED'}`);
      
      return matches;
    } catch (error) {
      console.error('❌ Encryption cycle test failed:', error);
      return false;
    }
  }
}

// Export default instance
export default EncryptionUtils;