/**
 * WhatsApp Business API Helper Functions
 *
 * This module provides utility functions for interacting with the
 * Meta WhatsApp Business API and managing WhatsApp message data.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * WhatsApp message structure from Meta webhook
 */
export interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
}

/**
 * Parsed message for internal use
 */
export interface ParsedWhatsAppMessage {
  from: string;
  messageId: string;
  message: string;
  timestamp: Date;
  type: string;
}

/**
 * Verify webhook token from Meta
 * Used during webhook setup in Meta Business Portal
 */
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { verified: boolean; challenge?: string } {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('WHATSAPP_VERIFY_TOKEN is not set in environment variables');
    return { verified: false };
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully');
    return { verified: true, challenge: challenge || undefined };
  }

  console.warn('❌ Webhook verification failed');
  return { verified: false };
}

/**
 * Parse incoming WhatsApp webhook message
 * Extracts relevant data from Meta's webhook payload
 */
export function parseIncomingMessage(body: any): ParsedWhatsAppMessage | null {
  try {
    // Meta sends webhook in this structure:
    // body.entry[0].changes[0].value.messages[0]
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      console.log('No messages found in webhook payload');
      return null;
    }

    const message: WhatsAppWebhookMessage = messages[0];

    // Extract text message (for now, only handling text)
    const messageText = message.text?.body || '[Non-text message]';

    return {
      from: message.from,
      messageId: message.id,
      message: messageText,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      type: message.type,
    };
  } catch (error) {
    console.error('Error parsing WhatsApp message:', error);
    return null;
  }
}

/**
 * Send a message via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not configured');
    return {
      success: false,
      error: 'WhatsApp credentials not configured',
    };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to send message',
      };
    }

    const data = await response.json();
    console.log('✅ Message sent successfully:', data);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Save WhatsApp message to Strapi CMS
 */
export async function saveMessageToStrapi(
  parsedMessage: ParsedWhatsAppMessage,
  reply?: string
): Promise<{ success: boolean; error?: string }> {
  const strapiToken = process.env.STRAPI_TOKEN;

  if (!strapiToken) {
    console.error('STRAPI_TOKEN not configured');
    return {
      success: false,
      error: 'Strapi token not configured',
    };
  }

  try {
    const response = await fetch(`${STRAPI_URL}/api/whatsapp-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${strapiToken}`,
      },
      body: JSON.stringify({
        data: {
          from: parsedMessage.from,
          message: parsedMessage.message,
          messageId: parsedMessage.messageId,
          timestamp: parsedMessage.timestamp.toISOString(),
          status: reply ? 'replied' : 'received',
          reply: reply || null,
          publishedAt: new Date().toISOString(), // Auto-publish
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Strapi save error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to save to Strapi',
      };
    }

    console.log('✅ Message saved to Strapi');
    return { success: true };
  } catch (error) {
    console.error('Error saving to Strapi:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch WhatsApp messages from Strapi
 * Used by admin panel to display message history
 */
export async function getWhatsAppMessages(
  limit: number = 20
): Promise<any[]> {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/whatsapp-messages?sort=timestamp:desc&pagination[limit]=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch messages from Strapi');
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return [];
  }
}
