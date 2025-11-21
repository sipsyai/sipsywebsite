/**
 * WhatsApp Business API Webhook Handler
 *
 * This API route handles:
 * - GET: Meta webhook verification (during setup)
 * - POST: Incoming WhatsApp messages
 *
 * Endpoint: https://sipsy.ai/api/webhooks/whatsapp
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhook,
  parseIncomingMessage,
  sendWhatsAppMessage,
  sendWhatsAppFlow,
  saveMessageToStrapi,
} from '@/lib/whatsapp';

/**
 * GET Handler - Webhook Verification
 *
 * Meta sends a GET request with these query parameters:
 * - hub.mode: 'subscribe'
 * - hub.verify_token: Your custom verify token
 * - hub.challenge: Random string to echo back
 *
 * If verification succeeds, respond with the challenge string.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('📞 Webhook verification request received');
    console.log('Mode:', mode, 'Token:', token ? '***' : 'missing');

    const verification = verifyWebhook(mode, token, challenge);

    if (verification.verified && verification.challenge) {
      console.log('✅ Webhook verified successfully');
      // Return challenge as plain text (Meta requires this)
      return new Response(verification.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('❌ Webhook verification failed');
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler - Incoming WhatsApp Messages
 *
 * Meta sends a POST request with message data when:
 * - A user sends a message to your WhatsApp Business number
 * - Message status changes (sent, delivered, read)
 *
 * Flow:
 * 1. Parse incoming message
 * 2. Send "ok" reply via WhatsApp API
 * 3. Save message to Strapi CMS
 * 4. Return 200 OK to Meta (required within 20 seconds)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📨 Incoming webhook payload:', JSON.stringify(body, null, 2));

    // Check if this is a message event
    const messageEvent = body.entry?.[0]?.changes?.[0]?.value;

    // Ignore status updates (delivered, read, etc.)
    if (messageEvent?.statuses) {
      console.log('ℹ️ Status update received, ignoring');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // Parse the incoming message
    const parsedMessage = parseIncomingMessage(body);

    if (!parsedMessage) {
      console.log('⚠️ No message to process');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    console.log('✅ Message parsed:', {
      from: parsedMessage.from,
      message: parsedMessage.message.substring(0, 50),
      timestamp: parsedMessage.timestamp,
    });

    // Check if message triggers the Flow
    const messageText = parsedMessage.message.toLowerCase().trim();
    const flowTriggers = ['pms', 'demo', 'flow', 'çalışma', 'saat', 'makine', 'gemi', 'start'];
    const shouldTriggerFlow = flowTriggers.some(trigger => messageText.includes(trigger));

    let sendResult;

    if (shouldTriggerFlow) {
      // Trigger Flow
      console.log('🚀 Triggering WhatsApp Flow for:', parsedMessage.from);
      sendResult = await sendWhatsAppFlow(parsedMessage.from);

      if (!sendResult.success) {
        console.error('Failed to send Flow:', sendResult.error);
        // Fallback to text message
        sendResult = await sendWhatsAppMessage(
          parsedMessage.from,
          'Flow başlatılamadı. Lütfen daha sonra tekrar deneyin.'
        );
      } else {
        console.log('✅ Flow message sent successfully');
      }
    } else {
      // Send regular "ok" reply
      sendResult = await sendWhatsAppMessage(
        parsedMessage.from,
        'ok'
      );

      if (!sendResult.success) {
        console.error('Failed to send reply:', sendResult.error);
      } else {
        console.log('✅ Reply sent successfully');
      }
    }

    // Save message and reply to Strapi
    const saveResult = await saveMessageToStrapi(
      parsedMessage,
      sendResult.success ? 'ok' : undefined
    );

    if (!saveResult.success) {
      console.error('Failed to save to Strapi:', saveResult.error);
    } else {
      console.log('✅ Message saved to Strapi');
    }

    // Always return 200 OK to Meta (even if our processing failed)
    // This prevents Meta from retrying the webhook
    return NextResponse.json(
      {
        status: 'ok',
        received: true,
        messageId: parsedMessage.messageId,
        replySent: sendResult.success,
        savedToStrapi: saveResult.success,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    // Still return 200 to prevent Meta retries
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
