# WhatsApp Flow Demo - Production Deployment Guide

Bu rehber, WhatsApp Flow Demo Bot'u AWS production sunucusuna nasıl deploy edeceğinizi adım adım gösterir.

## 📋 Ön Hazırlık

### 1. Meta Business Manager'da Flow Oluşturma

1. **Meta Business Manager**'a gidin: https://business.facebook.com
2. **WhatsApp Manager** > **Flows** seçin
3. **"Create Flow"** tıklayın
4. **"Import JSON"** seçin
5. `backend/src/api/whatsapp-flow-demo/whatsapp-flow.json` dosyasını yükleyin
6. **Endpoint URL** alanını doldurun:
   ```
   https://sipsy.ai/api/whatsapp-flow-demo/endpoint
   ```
7. **"Publish Flow"** yapın
8. **Flow ID**'yi kopyalayın (örn: `1234567890123456`)

### 2. Environment Variables Hazırlama

Production'daki `.env` dosyasına eklenecek:

```bash
# WhatsApp Flow Configuration
WHATSAPP_FLOW_ID=1234567890123456  # Meta'dan aldığınız Flow ID
```

## 🚀 Deployment Adımları

### Adım 1: Değişiklikleri Git'e Commit Edin

```bash
# Durumu kontrol et
git status

# Değişiklikleri ekle
git add backend/src/api/whatsapp-flow-demo
git add app/webhooks/whatsapp/route.ts
git add lib/whatsapp.ts
git add .env.example

# Commit
git commit -m "feat: Add WhatsApp Flow Demo PMS bot with webhook integration

- Add Flow Demo API (controllers, services, routes)
- Add mock data service with demo ships and machines
- Integrate Flow trigger with existing webhook
- Add sendWhatsAppFlow function for Flow messages
- Trigger Flow on keywords: pms, demo, flow, çalışma, saat, makine, gemi
- Add user +905079720490 to demo users
- Update .env.example with WHATSAPP_FLOW_ID"
```

### Adım 2: GitHub'a Push Edin

```bash
git push origin master
```

### Adım 3: AWS Sunucusuna Bağlanın

```bash
ssh -i C:\Users\Ali\Documents\Projects\sipsywebsite\sipsy-lightsail-key.pem bitnami@54.243.251.248
```

### Adım 4: Kodu Güncelleyin

```bash
# Proje dizinine git
cd ~/sipsywebsite

# Mevcut değişiklikleri kontrol et
git status

# Değişiklikler varsa stash yap (gerekirse)
git stash

# Kodu pull et
git pull origin master

# Stash'i geri getir (gerekirse)
git stash pop
```

### Adım 5: Environment Variables Ekleyin

```bash
# .env dosyasını düzenle
nano .env
```

Ekleyin:
```bash
# WhatsApp Flow Configuration
WHATSAPP_FLOW_ID=1234567890123456  # Meta'dan aldığınız gerçek Flow ID
```

Kaydet ve çık: `Ctrl+X`, `Y`, `Enter`

### Adım 6: Dependencies Güncelleyin (Gerekirse)

```bash
# Backend dependencies
cd ~/sipsywebsite/backend
npm install

# Frontend dependencies
cd ~/sipsywebsite
npm install
```

### Adım 7: Build Yapın

```bash
# Backend build
cd ~/sipsywebsite/backend
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Frontend build (gerekirse)
cd ~/sipsywebsite
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### Adım 8: Servisleri Restart Edin

```bash
# Strapi backend restart
pm2 restart strapi-backend

# Next.js frontend restart
pm2 restart nextjs-frontend

# Tüm servisleri restart (alternatif)
pm2 restart all
```

### Adım 9: Logları Kontrol Edin

```bash
# Strapi backend logs
pm2 logs strapi-backend --lines 50

# Next.js frontend logs
pm2 logs nextjs-frontend --lines 50

# Tüm loglar
pm2 logs --lines 50
```

## ✅ Test Etme

### 1. Endpoint Test

Production endpoint'in çalıştığını test edin:

```bash
curl -X POST https://sipsy.ai/api/whatsapp-flow-demo/endpoint \
  -H "Content-Type: application/json" \
  -d '{"action":"INIT","flow_token":"+905079720490"}'
```

Beklenen yanıt:
```json
{
  "version": "1.0",
  "screen": "MAIN_MENU",
  "data": {
    "user_name": "Ali",
    "ships": [...]
  }
}
```

### 2. WhatsApp'ta Test

1. WhatsApp'ı açın
2. WhatsApp Business numaranıza mesaj gönderin:
   ```
   pms
   ```
   veya
   ```
   demo
   ```
   veya
   ```
   çalışma saati
   ```
3. Flow mesajı gelecek: "🚢 Port Management System"
4. **"Başlat"** butonuna tıklayın
5. Interactive Flow UI açılacak!

### 3. Flow Senaryosu

1. **Gemi Seçin**: MV ATLAS
2. **Modül Seçin**: 🚢 Propulsion (İtici Sistem)
3. **Makine Seçin**: Ana Motor (Main Engine)
4. **Yeni Saat Girin**: 12480 (mevcut: 12450)
5. **Başarı Mesajı**: ✅ Güncelleme tamamlandı!

## 🔍 Sorun Giderme

### Problem: Flow mesajı gelmiyor

**Kontrol 1: Environment Variable**
```bash
cat .env | grep WHATSAPP_FLOW_ID
```
Boş mu? Ekleyin.

**Kontrol 2: Webhook Logs**
```bash
pm2 logs nextjs-frontend | grep "Flow"
```
"Flow başlatılamadı" hatası varsa, Flow ID yanlış olabilir.

### Problem: "Flow ID not configured" hatası

**Çözüm**: `.env` dosyasına `WHATSAPP_FLOW_ID` ekleyin ve servisleri restart edin:
```bash
pm2 restart all
```

### Problem: Flow açılıyor ama data gelmiyor

**Kontrol 1: Strapi Backend Logs**
```bash
pm2 logs strapi-backend --lines 100
```

**Kontrol 2: Endpoint Test**
```bash
curl -X POST https://sipsy.ai/api/whatsapp-flow-demo/endpoint \
  -H "Content-Type: application/json" \
  -d '{"action":"INIT","flow_token":"+905079720490"}'
```

**Çözüm**: Endpoint 200 dönmüyorsa, Strapi backend restart edin:
```bash
pm2 restart strapi-backend
```

### Problem: "User not found" hatası

**Çözüm**: Sadece bu numaralar destekleniyor (mock data):
- +905079720490 (Ali - tüm gemiler)
- +905551234567 (Kaptan Ahmet - ATLAS, NEPTUNE)
- +905559876543 (Kaptan Mehmet - NEPTUNE, POSEIDON)
- +905555555555 (Başmühendis Ali - ATLAS, POSEIDON)

### Problem: Servisler restart olmuyor

**Kontrol**:
```bash
pm2 list
```

**Çözüm**: Manuel başlatın:
```bash
cd ~/sipsywebsite
pm2 start ecosystem.config.js
```

## 📊 Monitoring

### PM2 Status
```bash
pm2 list
pm2 monit  # Real-time monitoring
```

### Disk Space
```bash
df -h
```

### Memory Usage
```bash
free -h
```

### Node Process
```bash
ps aux | grep node
```

## 🔄 Rollback (Geri Alma)

Eğer bir sorun olursa:

```bash
cd ~/sipsywebsite

# Önceki commit'e dön
git log --oneline -5  # Son 5 commit'i gör
git reset --hard <commit-hash>

# Servisleri restart et
pm2 restart all
```

## 📝 Notlar

1. **Mock Data**: Tüm data hardcoded. Restart edince eski haline döner.
2. **Session Timeout**: 15 dakika sonra session sona erer.
3. **Keywords**: Şu kelimeler Flow'u trigger eder:
   - pms, demo, flow
   - çalışma, saat, makine, gemi
   - start

4. **Webhook**: Mevcut webhook'a dokunmadık. Normal mesajlara "ok" yanıtı veriyor.

## 🎉 Başarı!

Deployment tamamlandı! Artık production'da WhatsApp Flow Demo Bot çalışıyor.

Test için: **+905079720490** numarasından WhatsApp Business'a "pms" yazın.

---

**Sorularınız için**: Strapi ve PM2 loglarına bakın.
**Acil durum**: `pm2 restart all` ile tüm servisleri restart edin.
