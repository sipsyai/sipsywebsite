/**
 * Encryption Service for WhatsApp Flow
 *
 * Handles decryption of incoming encrypted requests and encryption of responses.
 * Uses RSA for request decryption and AES for response encryption.
 */

import crypto from 'crypto';

class EncryptionService {
  private privateKey: string | null = null;

  constructor() {
    // Load private key from environment
    // Convert \n strings to actual newlines
    const key = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
    if (key) {
      this.privateKey = key.replace(/\\n/g, '\n');
      console.log('[EncryptionService] Private key loaded successfully');
      console.log('[EncryptionService] Key starts with:', this.privateKey.substring(0, 30));
    } else {
      this.privateKey = null;
      console.log('[EncryptionService] No private key configured');
    }
  }

  /**
   * Decrypt incoming encrypted request from WhatsApp
   * WhatsApp uses AES-128-GCM with RSA-OAEP encrypted key
   * Per WhatsApp Flows documentation for data_api_version 3.0
   */
  decryptRequest(encryptedData: string, encryptedAesKey: string, initialVector: string): any {
    if (!this.privateKey) {
      throw new Error('Private key not configured');
    }

    try {
      // Step 1: Decrypt the AES key using RSA private key
      console.log('[EncryptionService] Decrypting AES key...');
      const decryptedAesKey = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedAesKey, 'base64')
      );
      console.log('[EncryptionService] AES key decrypted, length:', decryptedAesKey.length);

      // Step 2: Decrypt the flow data using AES-128-GCM
      const flowDataBuffer = Buffer.from(encryptedData, 'base64');
      const iv = Buffer.from(initialVector, 'base64');

      // For AES-GCM, the authentication tag is appended at the end (16 bytes)
      const TAG_LENGTH = 16;
      const encryptedDataBody = flowDataBuffer.subarray(0, -TAG_LENGTH);
      const authTag = flowDataBuffer.subarray(-TAG_LENGTH);

      console.log('[EncryptionService] Encrypted data length:', encryptedDataBody.length);
      console.log('[EncryptionService] Auth tag length:', authTag.length);

      // Create decipher with AES-128-GCM
      const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encryptedDataBody);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const decryptedStr = decrypted.toString('utf8');
      console.log('[EncryptionService] Request decrypted successfully');

      return JSON.parse(decryptedStr);
    } catch (error) {
      console.error('[EncryptionService] Decryption error:', error);
      throw new Error('Failed to decrypt request');
    }
  }

  /**
   * Encrypt response data for WhatsApp
   * Uses AES-128-GCM with flipped IV
   * Per WhatsApp Flows documentation for data_api_version 3.0
   */
  encryptResponse(responseData: any, aesKey: Buffer, initialVector: string): string {
    try {
      const iv = Buffer.from(initialVector, 'base64');

      // Flip the IV (bitwise NOT)
      const flippedIv = Buffer.alloc(iv.length);
      for (let i = 0; i < iv.length; i++) {
        flippedIv[i] = ~iv[i];
      }

      console.log('[EncryptionService] Encrypting response with flipped IV');

      // Create cipher with AES-128-GCM
      const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);

      // Encrypt
      let encrypted = cipher.update(JSON.stringify(responseData), 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Concatenate encrypted data + auth tag
      const result = Buffer.concat([encrypted, authTag]);

      console.log('[EncryptionService] Response encrypted successfully');

      return result.toString('base64');
    } catch (error) {
      console.error('[EncryptionService] Encryption error:', error);
      throw new Error('Failed to encrypt response');
    }
  }

  /**
   * Check if encryption is configured
   */
  isConfigured(): boolean {
    return this.privateKey !== null;
  }
}

// Export singleton instance
export default new EncryptionService();
