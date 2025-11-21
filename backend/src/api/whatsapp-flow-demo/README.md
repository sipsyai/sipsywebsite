# WhatsApp Flow Demo - Port Management System

Bu klasör, whatsappanalysis.md'deki Port Management System (PMS) yapısını WhatsApp Flow API kullanarak demo eden bir bot içerir.

## 📋 Özellikler

- ✅ **Mock Data**: Gerçek veritabanı gerekmez, hardcoded demo data kullanır
- ✅ **Session Management**: In-memory session yönetimi (Redis gerektirmez)
- ✅ **Interactive UI**: WhatsApp içinde çok-ekranlı form UI'ı
- ✅ **Validation**: Saat validasyonu, optimistic locking
- ✅ **Bağımsız**: Mevcut Strapi content type'larına dokunmaz

## 🏗️ Mimari

```
whatsapp-flow-demo/
├── controllers/
│   ├── flow-controller.ts      # INIT ve data_exchange handler
│   └── index.ts
├── services/
│   ├── mock-data-service.ts    # Hardcoded demo data (gemiler, makineler)
│   ├── session-service.ts      # In-memory session management
│   └── validation-service.ts   # Validasyon kuralları
├── routes/
│   ├── flow-routes.ts          # API endpoint tanımları
│   └── index.ts
├── whatsapp-flow.json          # WhatsApp Flow UI tanımı (Meta'ya yüklenecek)
└── README.md                   # Bu dosya
```

## 🚀 Kurulum

### 1. Strapi'yi Başlatın

Strapi sunucunuz çalışıyor olmalı:

```bash
cd backend
npm run develop
```

Endpoint şu adreste hazır olacak:
```
http://localhost:1337/api/whatsapp-flow-demo/endpoint
```

### 2. Ngrok ile Public URL Alın

WhatsApp Cloud API'nin endpoint'inize erişmesi için public URL gerekli:

```bash
ngrok http 1337
```

Ngrok size şöyle bir URL verecek:
```
https://abc123.ngrok.io
```

Tam endpoint URL'iniz:
```
https://abc123.ngrok.io/api/whatsapp-flow-demo/endpoint
```

### 3. WhatsApp Flow'u Meta'ya Yükleyin

1. **Meta Business Manager**'a gidin: https://business.facebook.com
2. **WhatsApp Manager** > **Flows** bölümüne gidin
3. **"Create Flow"** butonuna tıklayın
4. **"Import JSON"** seçeneğini seçin
5. `whatsapp-flow.json` dosyasını yükleyin
6. **Endpoint URL** kısmına ngrok URL'inizi girin:
   ```
   https://abc123.ngrok.io/api/whatsapp-flow-demo/endpoint
   ```
7. **"Publish Flow"** yapın
8. **Flow ID**'yi not alın (örn: `1234567890123456`)

### 4. Test Telefon Numarasını Ekleyin

1. Meta Business Manager'da **WhatsApp > Settings > Phone Numbers**
2. **Test Numbers** bölümünden test telefon numaranızı ekleyin
3. Numaranızı doğrulayın

## 🧪 Test Etme

### Local Test (Postman/curl ile)

**INIT Action Test:**
```bash
curl -X POST http://localhost:1337/api/whatsapp-flow-demo/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "action": "INIT",
    "flow_token": "+905551234567",
    "version": "1.0"
  }'
```

Beklenen Yanıt:
```json
{
  "version": "1.0",
  "screen": "MAIN_MENU",
  "data": {
    "user_name": "Kaptan Ahmet",
    "ships": [
      {
        "id": "ship_001",
        "title": "MV ATLAS",
        "description": "Turkey | IMO: 9876543"
      },
      {
        "id": "ship_002",
        "title": "MV NEPTUNE",
        "description": "Turkey | IMO: 9876544"
      }
    ]
  }
}
```

**data_exchange Action Test (Gemi Seçimi):**
```bash
curl -X POST http://localhost:1337/api/whatsapp-flow-demo/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "action": "data_exchange",
    "flow_token": "+905551234567",
    "screen": "SHIP_SELECT",
    "data": {
      "selected_ship_id": "ship_001"
    }
  }'
```

### WhatsApp'ta Test

1. WhatsApp'ı açın
2. Meta'dan aldığınız **WhatsApp Business numarasına** mesaj gönderin
3. Flow'u trigger eden mesajı gönderin (Meta'da yapılandırdığınız trigger)
4. Flow UI açılacak, adım adım ilerleyin:
   - ✅ Gemi seçin (MV ATLAS)
   - ✅ Modül seçin (Propulsion)
   - ✅ Makine seçin (Ana Motor)
   - ✅ Yeni çalışma saati girin (örn: 12480)
   - ✅ Onay ekranını görün

## 📊 Demo Data

### Kullanıcılar

| İsim | Telefon | Rol | Gemiler |
|------|---------|-----|---------|
| Kaptan Ahmet | +905551234567 | captain | MV ATLAS, MV NEPTUNE |
| Kaptan Mehmet | +905559876543 | captain | MV NEPTUNE, MV POSEIDON |
| Başmühendis Ali | +905555555555 | chief_engineer | MV ATLAS, MV POSEIDON |

### Gemiler

1. **MV ATLAS** (IMO: 9876543)
   - Ana Motor (ME-01): 12450 saat
   - Jeneratör 1 (GE-01): 8320 saat
   - Jeneratör 2 (GE-02): 7890 saat
   - Pompa 1 (PP-01): 5670 saat
   - Kargo Pompası (CP-01): 3210 saat

2. **MV NEPTUNE** (IMO: 9876544)
   - Ana Motor (ME-01): 15230 saat
   - Jeneratör 1 (GE-01): 9540 saat
   - Balast Pompası (BP-01): 4320 saat

3. **MV POSEIDON** (IMO: 9876545)
   - Ana Motor (ME-01): 18750 saat
   - Klima (AC-01): 12100 saat

## 🔧 Validasyon Kuralları

1. **Saat Artışı**: Yeni saat >= mevcut saat
2. **Maksimum Artış**: Tek seferde maksimum 500 saat artış
3. **Optimistic Locking**: Version kontrolü ile eşzamanlılık koruması
4. **Yetkilendirme**: Kullanıcı sadece kendi gemilerine erişebilir

## 🐛 Debug

### Konsol Logları

Controller'da detaylı loglar var:

```typescript
console.log('[FlowController] Received INIT request', { flow_token, screen, data });
console.log('[FlowController] Response sent:', response);
```

Strapi console'da bu logları görebilirsiniz.

### Session Durumu

Session service'deki utility methodları kullanabilirsiniz:

```typescript
import sessionService from './services/session-service';

// Tüm aktif sessionları görüntüle
console.log(sessionService.getAllSessions());

// Session sayısını öğren
console.log(sessionService.getSessionCount());

// Belirli bir session'ı kontrol et
console.log(sessionService.getSession('+905551234567'));
```

### Mock Data Değiştirme

`services/mock-data-service.ts` dosyasında `initializeMockData()` methodunu düzenleyerek:
- Yeni gemiler ekleyebilirsiniz
- Makine saatlerini değiştirebilirsiniz
- Yeni kullanıcılar ekleyebilirsiniz

## 🚀 Production'a Alma (İsteğe Bağlı)

### AWS'e Deploy

1. **Kodu AWS'e Push**:
```bash
git add backend/src/api/whatsapp-flow-demo
git commit -m "feat: Add WhatsApp Flow Demo PMS bot"
git push origin master
```

2. **AWS'de Pull**:
```bash
ssh -i sipsy-lightsail-key.pem bitnami@54.243.251.248
cd ~/sipsywebsite
git pull origin master
```

3. **Strapi'yi Restart**:
```bash
pm2 restart strapi-backend
```

4. **Endpoint URL'i Güncelleyin**:
Meta Business Manager'da Flow endpoint URL'ini değiştirin:
```
https://sipsy.ai/api/whatsapp-flow-demo/endpoint
```

## ⚠️ Önemli Notlar

1. **Mevcut Sistemi Etkilemez**: Bu demo bot, Sipsy'nin mevcut Strapi content type'larına veya WhatsApp webhook'una dokunmaz.

2. **Session Timeout**: In-memory session'lar 15 dakika sonra otomatik silinir.

3. **Mock Data**: Tüm data hardcoded'dur. Strapi'yi restart ettiğinizde eski haline döner.

4. **Auth Yok**: Endpoint public'tir (WhatsApp Cloud API erişimi için). Production'da imza doğrulaması eklenmelidir.

## 📞 Flow Token Format

Demo'da flow_token olarak telefon numarası kullanılıyor:

```
flow_token: "+905551234567"
```

Production'da bu encrypted/signed bir token olmalıdır.

## 🎯 Sonraki Adımlar

1. ✅ Local'de test edin (curl/Postman)
2. ✅ Ngrok ile public endpoint açın
3. ✅ Meta'ya Flow JSON'u yükleyin
4. ✅ WhatsApp'ta test edin
5. 🔄 İsterseniz production'a alın (AWS'e deploy)

## 📚 Referanslar

- [WhatsApp Flow API Docs](https://developers.facebook.com/docs/whatsapp/flows)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Strapi Custom Routes](https://docs.strapi.io/dev-docs/backend-customization/routes)
- Original Analysis: `whatsappanalysis.md`

## 🤝 Yardım

Sorularınız için:
- Strapi loglarını kontrol edin: `npm run develop` console output
- Ngrok loglarını kontrol edin: http://localhost:4040
- Meta Business Manager webhook loglarını kontrol edin

---

**Not**: Bu demo bot, whatsappanalysis.md'deki yapının proof-of-concept implementasyonudur. Production kullanımı için güvenlik, ölçeklenebilirlik ve error handling iyileştirmeleri gereklidir.
