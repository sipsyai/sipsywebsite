/**
 * WhatsApp Admin Panel
 *
 * A simple dashboard to monitor WhatsApp webhook status
 * and view recent incoming messages.
 *
 * Access: https://sipsy.ai/whatsapp
 */

import { getWhatsAppMessages } from '@/lib/whatsapp';

export default async function WhatsAppAdminPage() {
  // Fetch recent messages from Strapi
  const messages = await getWhatsAppMessages(20);

  // Check if webhook environment variables are configured
  const isWebhookConfigured =
    !!process.env.WHATSAPP_VERIFY_TOKEN &&
    !!process.env.WHATSAPP_ACCESS_TOKEN &&
    !!process.env.WHATSAPP_PHONE_NUMBER_ID;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              WhatsApp Webhook Admin
            </h1>
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ← Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Webhook Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Webhook Durumu
          </h2>

          <div className="space-y-3">
            {/* Configuration Status */}
            <div className="flex items-center space-x-3">
              {isWebhookConfigured ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    ✅ Webhook Yapılandırıldı
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">
                    ❌ Webhook Yapılandırılmadı
                  </span>
                </>
              )}
            </div>

            {/* Webhook URL */}
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Webhook URL:</p>
              <code className="text-sm font-mono text-blue-600 break-all">
                https://sipsy.ai/api/webhooks/whatsapp
              </code>
            </div>

            {/* Configuration Warning */}
            {!isWebhookConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Webhook environment variables eksik. Lütfen{' '}
                  <code className="bg-yellow-100 px-2 py-1 rounded">
                    .env.local
                  </code>{' '}
                  dosyasını kontrol edin.
                </p>
              </div>
            )}

            {/* Setup Instructions */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                📖 Meta Business'ta Webhook Nasıl Kurulur?
              </summary>
              <div className="mt-3 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
                <p>
                  <strong>1.</strong> Meta Business hesabınıza giriş yapın
                </p>
                <p>
                  <strong>2.</strong> WhatsApp &gt; Yapılandırma &gt; Webhook
                  sayfasına gidin
                </p>
                <p>
                  <strong>3.</strong> Webhook URL'yi girin:{' '}
                  <code className="bg-white px-2 py-1 rounded">
                    https://sipsy.ai/api/webhooks/whatsapp
                  </code>
                </p>
                <p>
                  <strong>4.</strong> Verify Token'ı girin (
                  <code>WHATSAPP_VERIFY_TOKEN</code>)
                </p>
                <p>
                  <strong>5.</strong> "Doğrula ve Kaydet" butonuna tıklayın
                </p>
                <p>
                  <strong>6.</strong> "messages" event'ini subscribe edin
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* Messages List Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Son Mesajlar
            </h2>
            <span className="text-sm text-gray-500">
              Toplam: {messages.length}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">📭 Henüz mesaj yok</p>
              <p className="text-sm text-gray-400">
                WhatsApp Business numaranıza mesaj gönderildiğinde burada
                görünecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const attributes = msg.attributes || msg;
                const timestamp = new Date(attributes.timestamp);

                return (
                  <div
                    key={msg.id || attributes.messageId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {attributes.from?.slice(-2) || '??'}
                        </div>
                        <div>
                          <p className="font-mono text-sm text-gray-700">
                            {attributes.from || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {timestamp.toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          attributes.status === 'replied'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {attributes.status === 'replied'
                          ? '✓ Yanıtlandı'
                          : '○ Alındı'}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {attributes.message || '[Mesaj yok]'}
                      </p>
                    </div>

                    {/* Reply */}
                    {attributes.reply && (
                      <div className="bg-blue-50 rounded p-3 ml-6 border-l-4 border-blue-500">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Yanıt:
                        </p>
                        <p className="text-sm text-blue-800">
                          {attributes.reply}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Mesajları yenilemek için sayfayı yenileyin. Otomatik güncelleme
            henüz eklenmedi.
          </p>
        </div>
      </main>
    </div>
  );
}
