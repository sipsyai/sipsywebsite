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
    this.privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY || null;
  }

  /**
   * Decrypt incoming encrypted request from WhatsApp
   * WhatsApp sends encrypted data using RSA-OAEP with our public key
   */
  decryptRequest(encryptedData: string, encryptedAesKey: string, initialVector: string): any {
    if (!this.privateKey) {
      throw new Error('Private key not configured');
    }

    try {
      // Decrypt the AES key using RSA private key
      const decryptedAesKey = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedAesKey, 'base64')
      );

      // Decrypt the data using AES key
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        decryptedAesKey,
        Buffer.from(initialVector, 'base64')
      );

      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt request');
    }
  }

  /**
   * Encrypt response data for WhatsApp
   * Response is encrypted using the same AES key that was used for the request
   */
  encryptResponse(responseData: any, aesKey: Buffer, initialVector: string): string {
    try {
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        aesKey,
        Buffer.from(initialVector, 'base64')
      );

      let encrypted = cipher.update(JSON.stringify(responseData), 'utf8', 'base64');
      encrypted += cipher.final('base64');

      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
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
