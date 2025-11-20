# WhatsApp Business API Integration Setup Guide

This guide walks you through setting up the WhatsApp webhook integration for sipsy.ai.

## 📋 Table of Contents

1. [Strapi Content Type Setup](#1-strapi-content-type-setup)
2. [Environment Variables Configuration](#2-environment-variables-configuration)
3. [Meta Business API Setup](#3-meta-business-api-setup)
4. [Testing Locally](#4-testing-locally)
5. [Production Deployment](#5-production-deployment)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Strapi Content Type Setup

### Step 1: Access Strapi Admin Panel

1. Start your backend server:
   ```bash
   cd backend
   npm run develop
   ```

2. Open browser and go to: `http://localhost:1337/admin`

3. Login with your admin credentials

### Step 2: Create WhatsApp Message Content Type

1. Click **"Content-Type Builder"** in the left sidebar
2. Under **"COLLECTION TYPES"**, click **"+ Create new collection type"**
3. Enter display name: `WhatsApp Message`
4. API ID (singular): `whatsapp-message` (auto-generated)
5. API ID (plural): `whatsapp-messages` (auto-generated)
6. Click **"Continue"**

### Step 3: Add Fields

Add the following fields one by one:

#### Field 1: from (Phone Number)
- **Type**: Text
- **Name**: `from`
- **Advanced Settings**:
  - ✅ Required field
  - ✅ Unique field
  - Regular expression: Leave empty
- Click **"Finish"**

#### Field 2: message (Message Text)
- **Type**: Text (Long text)
- **Name**: `message`
- **Advanced Settings**:
  - ✅ Required field
  - Type: Long text
- Click **"Finish"**

#### Field 3: messageId (WhatsApp Message ID)
- **Type**: Text
- **Name**: `messageId`
- **Advanced Settings**:
  - ✅ Required field
  - ✅ Unique field
- Click **"Finish"**

#### Field 4: timestamp (Message Timestamp)
- **Type**: DateTime
- **Name**: `timestamp`
- **Advanced Settings**:
  - ✅ Required field
- Click **"Finish"**

#### Field 5: status (Message Status)
- **Type**: Enumeration
- **Name**: `status`
- **Values**:
  - `received`
  - `replied`
- **Advanced Settings**:
  - ✅ Required field
  - Default value: `received`
- Click **"Finish"**

#### Field 6: reply (Reply Text)
- **Type**: Text
- **Name**: `reply`
- **Advanced Settings**:
  - ❌ NOT Required (optional)
- Click **"Finish"**

### Step 4: Save Content Type

1. Click **"Save"** button (top right)
2. Wait for server restart (this may take 30-60 seconds)
3. You should see "whatsapp-messages" in the collection types list

### Step 5: Configure API Permissions

1. Click **"Settings"** in the left sidebar
2. Under **"USERS & PERMISSIONS PLUGIN"**, click **"Roles"**
3. Click on **"Public"** role
4. Scroll down to find **"Whatsapp-message"**
5. Check these permissions:
   - ✅ `find` (to list messages)
   - ✅ `findOne` (to get single message)
   - ❌ `create` (do NOT check - we use authenticated endpoint)
   - ❌ `update`, `delete` (keep unchecked for security)
6. Click **"Save"** button (top right)

7. Go back to **"Roles"**
8. Click on **"Authenticated"** role (for API access with token)
9. Find **"Whatsapp-message"**
10. Check ALL permissions:
    - ✅ `find`
    - ✅ `findOne`
    - ✅ `create`
    - ✅ `update`
    - ✅ `delete`
11. Click **"Save"** button

✅ **Content Type Setup Complete!**

---

## 2. Environment Variables Configuration

### Local Development (.env.local)

The `.env.local` file has been updated with WhatsApp variables. Replace the placeholder values:

```bash
# WhatsApp Business API Configuration
WHATSAPP_VERIFY_TOKEN=sipsy_webhook_2024_secure_random_string
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
```

### How to Get These Values:

1. **WHATSAPP_VERIFY_TOKEN**:
   - Create your own secure random string (min 20 characters)
   - Example: `sipsy_webhook_$(openssl rand -hex 16)`

2. **WHATSAPP_ACCESS_TOKEN**:
   - Go to: https://business.facebook.com
   - Select your app → WhatsApp → API Setup
   - Copy the "Temporary access token" (24 hours) or generate a permanent one

3. **WHATSAPP_PHONE_NUMBER_ID**:
   - Same page as access token
   - Under "Phone number ID"

4. **WHATSAPP_BUSINESS_ACCOUNT_ID**:
   - Same page, at the top
   - "WhatsApp Business Account ID"

### Production (.env.production)

Add the same variables to your production environment:

```bash
# On AWS Lightsail server
ssh -i sipsy-lightsail-key.pem bitnami@54.243.251.248

# Edit production env file
cd ~/sipsywebsite
nano .env.production

# Add the WhatsApp variables with PRODUCTION values
# Save and exit (Ctrl+X, Y, Enter)

# Restart services
pm2 restart all
```

---

## 3. Meta Business API Setup

### Step 1: Create/Access Facebook App

1. Go to: https://developers.facebook.com
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** type
4. Fill in app details
5. Click **"Create App"**

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. Choose **"Business"** plan
4. Complete the setup wizard

### Step 3: Configure Webhook

1. In WhatsApp product settings, go to **"Configuration"**
2. Under **"Webhook"** section, click **"Edit"**

3. **For Local Testing** (using ngrok):
   ```bash
   # Install ngrok if not installed
   npm install -g ngrok

   # Start your Next.js dev server
   npm run dev

   # In another terminal, create tunnel
   ngrok http 3000

   # Use the HTTPS URL from ngrok
   ```

   - Callback URL: `https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp`
   - Verify Token: (paste your `WHATSAPP_VERIFY_TOKEN`)

4. **For Production**:
   - Callback URL: `https://sipsy.ai/api/webhooks/whatsapp`
   - Verify Token: (paste your production `WHATSAPP_VERIFY_TOKEN`)

5. Click **"Verify and Save"**

6. If verification succeeds, you'll see ✅ **"Verified"**

### Step 4: Subscribe to Webhook Fields

1. Under **"Webhook fields"**, click **"Manage"**
2. Check these fields:
   - ✅ `messages` (required)
   - ✅ `message_template_status_update` (optional)
3. Click **"Save"**

### Step 5: Add Phone Number

1. Go to **"API Setup"** tab
2. Click **"Add phone number"**
3. Follow the verification process
4. Complete phone number setup

✅ **Meta Business API Setup Complete!**

---

## 4. Testing Locally

### Test 1: Verify Webhook URL

```bash
# Start Next.js dev server
npm run dev

# In another terminal, test GET endpoint
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test123"

# Expected response: test123
```

### Test 2: Send Test Message

1. Open WhatsApp on your phone
2. Send a message to your WhatsApp Business number
3. Check console logs for:
   ```
   📨 Incoming webhook payload: {...}
   ✅ Message parsed: {...}
   ✅ Reply sent successfully
   ✅ Message saved to Strapi
   ```

### Test 3: Check Admin Panel

1. Open browser: `http://localhost:3000/whatsapp`
2. You should see:
   - ✅ Webhook Yapılandırıldı (green status)
   - Your test message in the list
   - Status: "✓ Yanıtlandı"
   - Reply: "ok"

### Test 4: Check Strapi

1. Go to: `http://localhost:1337/admin`
2. Click **"Content Manager"** → **"WhatsApp Message"**
3. You should see your test message entry

✅ **Local Testing Complete!**

---

## 5. Production Deployment

### Step 1: Update Environment Variables

```bash
# SSH to production server
ssh -i sipsy-lightsail-key.pem bitnami@54.243.251.248

# Navigate to project
cd ~/sipsywebsite

# Edit .env.production
nano .env.production

# Add these lines (replace with actual values):
WHATSAPP_VERIFY_TOKEN=your_production_verify_token
WHATSAPP_ACCESS_TOKEN=your_production_access_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_production_business_id

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 2: Deploy Code Changes

```bash
# Pull latest code from git
git pull origin master

# Install dependencies (if any new packages)
npm install

# Restart services
pm2 restart all

# Check logs
pm2 logs nextjs-frontend --lines 50
```

### Step 3: Update Meta Webhook URL

1. Go to: https://developers.facebook.com
2. Open your app → WhatsApp → Configuration
3. Edit Webhook:
   - Callback URL: `https://sipsy.ai/api/webhooks/whatsapp`
   - Verify Token: (your production token)
4. Click **"Verify and Save"**

### Step 4: Test Production Webhook

Send a test message to your production WhatsApp number.

Check logs:
```bash
pm2 logs nextjs-frontend --lines 100
```

### Step 5: Verify Admin Panel

1. Open: https://sipsy.ai/whatsapp
2. Check webhook status (should be green)
3. Verify message appears in the list

✅ **Production Deployment Complete!**

---

## 6. Troubleshooting

### Issue: Webhook Verification Failed

**Symptoms**: Meta shows "Verification failed" when setting up webhook

**Solutions**:
1. Check `WHATSAPP_VERIFY_TOKEN` matches in both:
   - Your `.env.local` or `.env.production`
   - Meta Business webhook configuration
2. Ensure Next.js server is running
3. For local testing, ensure ngrok is running and URL is correct
4. Check server logs for errors

### Issue: Messages Not Appearing in Admin Panel

**Symptoms**: Webhook receives messages but admin panel is empty

**Solutions**:
1. Check Strapi API permissions (see Step 5 in Strapi setup)
2. Verify `STRAPI_TOKEN` is set in environment
3. Check Strapi logs:
   ```bash
   cd backend
   npm run develop
   ```
4. Test Strapi API directly:
   ```bash
   curl http://localhost:1337/api/whatsapp-messages
   ```

### Issue: "ok" Reply Not Sent

**Symptoms**: Message received but no reply sent to user

**Solutions**:
1. Verify `WHATSAPP_ACCESS_TOKEN` is valid (not expired)
2. Check `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Ensure phone number has required permissions in Meta Business
4. Check webhook POST handler logs for errors

### Issue: 500 Internal Server Error

**Symptoms**: Webhook returns 500 error

**Solutions**:
1. Check all environment variables are set
2. Review server logs:
   ```bash
   pm2 logs nextjs-frontend --lines 100
   ```
3. Test locally first to isolate issue
4. Verify Strapi backend is running and accessible

### Issue: Environment Variables Not Loading

**Symptoms**: Code shows "not configured" warnings

**Solutions**:
1. Restart Next.js dev server after changing `.env.local`
2. For production, restart PM2:
   ```bash
   pm2 restart all
   ```
3. Verify file name is exactly `.env.local` (not `.env.txt`)
4. Check environment variables are loaded:
   ```javascript
   console.log('Verify token:', process.env.WHATSAPP_VERIFY_TOKEN ? 'SET' : 'NOT SET');
   ```

### Issue: Duplicate Messages in Strapi

**Symptoms**: Same message appears multiple times

**Solutions**:
1. This shouldn't happen due to `messageId` unique constraint
2. If it does, check:
   - Strapi field `messageId` is marked as "Unique"
   - Webhook isn't being called multiple times
3. Check Meta webhook logs for duplicate deliveries

---

## 📝 Quick Reference

### API Endpoints

- **Webhook URL**: `https://sipsy.ai/api/webhooks/whatsapp`
- **Admin Panel**: `https://sipsy.ai/whatsapp`
- **Strapi Admin**: `https://sipsy.ai/admin`
- **Strapi API**: `https://sipsy.ai/api/whatsapp-messages`

### Important Files

```
/app/api/webhooks/whatsapp/route.ts  # Webhook handler
/app/whatsapp/page.tsx               # Admin panel
/lib/whatsapp.ts                     # Helper functions
/lib/types.ts                        # TypeScript types
/.env.local                          # Local environment
/.env.production                     # Production environment
```

### Useful Commands

```bash
# Local development
npm run dev

# Test webhook locally
ngrok http 3000

# Deploy to production
ssh -i sipsy-lightsail-key.pem bitnami@54.243.251.248
cd ~/sipsywebsite
git pull origin master
pm2 restart all

# View logs
pm2 logs nextjs-frontend --lines 100
pm2 logs strapi-backend --lines 100
```

---

## 🎉 Success Checklist

- [ ] Strapi content type created
- [ ] API permissions configured
- [ ] Environment variables set (local)
- [ ] Environment variables set (production)
- [ ] Meta Business app created
- [ ] WhatsApp product added
- [ ] Webhook URL verified by Meta
- [ ] Webhook fields subscribed
- [ ] Test message sent successfully
- [ ] "ok" reply received in WhatsApp
- [ ] Message appears in admin panel
- [ ] Message saved in Strapi
- [ ] Production deployment complete

---

**Need help?** Check the console logs first, they provide detailed error messages and execution flow information.
