# 🚀 Quick Start Guide - WhatsApp Flow Demo

5 dakikada WhatsApp Flow Demo'yu çalıştırın!

## 📋 Ön Gereksinimler

- ✅ Strapi backend çalışıyor olmalı
- ✅ Ngrok kurulu olmalı (https://ngrok.com/download)
- ✅ Meta Business Manager hesabı

## 🎯 Adım 1: Strapi'yi Başlatın (1 dakika)

```bash
cd backend
npm run develop
```

Terminal'de şunu göreceksiniz:
```
Server running on http://localhost:1337
```

## 🌐 Adım 2: Ngrok ile Public URL Alın (1 dakika)

Yeni terminal açın:

```bash
ngrok http 1337
```

Ngrok size şöyle bir URL verecek:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:1337
```

**Endpoint URL'inizi not alın**:
```
https://abc123.ngrok.io/api/whatsapp-flow-demo/endpoint
```

## 🧪 Adım 3: Local Test (1 dakika)

Yeni terminal açın ve test edin:

```bash
curl -X POST http://localhost:1337/api/whatsapp-flow-demo/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "action": "INIT",
    "flow_token": "+905551234567"
  }'
```

**Başarılı Yanıt:**
```json
{
  "version": "1.0",
  "screen": "MAIN_MENU",
  "data": {
    "user_name": "Kaptan Ahmet",
    "ships": [...]
  }
}
```

✅ Çalışıyor! Devam edebilirsiniz.

❌ Hata alıyorsanız:
- Strapi'nin çalıştığından emin olun
- Endpoint URL'in doğru olduğunu kontrol edin
- Console'da hata loglarına bakın

## 📱 Adım 4: Meta'ya Flow JSON Yükleyin (2 dakika)

1. https://business.facebook.com adresine gidin
2. **WhatsApp Manager** > **Flows** seçin
3. **"Create Flow"** tıklayın
4. **"Import JSON"** seçin
5. `backend/src/api/whatsapp-flow-demo/whatsapp-flow.json` dosyasını seçin
6. **Endpoint URL** kısmına ngrok URL'inizi yapıştırın:
   ```
   https://abc123.ngrok.io/api/whatsapp-flow-demo/endpoint
   ```
7. **"Save"** ve **"Publish"** yapın
8. **Flow ID**'yi kopyalayın (örn: `1234567890123456`)

## 🎉 Bitti!

Artık WhatsApp'ta test edebilirsiniz:

1. WhatsApp'ı açın
2. Meta'dan aldığınız WhatsApp Business numarasına yazın
3. Flow'u başlatan mesajı gönderin
4. Interactive UI açılacak!

## 🔍 Hızlı Test Senaryosu

1. **Gemi seçin**: MV ATLAS
2. **Modül seçin**: 🚢 Propulsion (İtici Sistem)
3. **Makine seçin**: Ana Motor (Main Engine)
4. **Yeni saat girin**: 12480 (mevcut: 12450)
5. **Onaylayın**: ✅ Başarılı!

## 🐛 Sorun Giderme

### "Machine not found" hatası
- Mock data'da sadece 3 kullanıcı var: `+905551234567`, `+905559876543`, `+905555555555`
- flow_token olarak bunlardan birini kullanın

### "Session expired" hatası
- Session 15 dakika sonra sona eriyor
- Flow'u yeniden başlatın

### Ngrok URL değişti
- Ngrok her yeniden başlatmada yeni URL verir (ücretsiz plan)
- Meta Business Manager'da endpoint URL'i güncelleyin
- Veya ngrok'u kapatmayın

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için:
```bash
cat backend/src/api/whatsapp-flow-demo/README.md
```

---

**Tebrikler!** 🎊 WhatsApp Flow Demo botunuz çalışıyor!
