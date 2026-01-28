## 🔍 Daraja STK Push Debugging Checklist

### ❌ Issues Found:

1. **PASSKEY**: `YourSandboxPasskeyHere` - This is a placeholder!
2. **CALLBACK URL**: `https://your-server.com/api/stk-callback` - This is a placeholder!
3. **Environment Variables**: All set correctly ✅

### 🛠️ Critical Fixes Needed:

#### 1. Get Real Sandbox Passkey:
- Go to Daraja Developer Portal: https://developer.safaricom.co.ke/
- Login to your sandbox account
- Find your sandbox passkey in the app settings
- Replace `YourSandboxPasskeyHere` with actual passkey

#### 2. Set Up Callback URL:
**Option A - Ngrok (for testing):**
```bash
npx ngrok http 3000
# Use the ngrok URL: https://abc123.ngrok.io/api/stk-callback
```

**Option B - Local testing:**
```bash
# Update to: http://localhost:3000/api/stk-callback
# But this won't work with M-Pesa (needs public URL)
```

#### 3. Create Callback Endpoint:
You need an HTTP endpoint to receive M-Pesa callbacks in `convex/http.ts` or `convex/router.ts`

### 🧪 Testing Steps:

1. **First**: Update PASSKEY and CALLBACK_URL
2. **Then**: Test connection with `testDarajaConnection`
3. **Finally**: Try STK push with real phone number

### 📱 Phone Number Format:
Use format: `254712345678` (Kenyan format with country code)

### 🔧 Commands to Fix:

```bash
# Update passkey
npx convex env set DARAJA_PASSKEY "your_real_sandbox_passkey"

# Update callback URL (use ngrok)
npx convex env set DARAJA_CALLBACK_URL "https://your-ngrok-url.ngrok.io/api/stk-callback"
```

### 📋 Expected Flow:
1. OAuth token ✅ (should work)
2. STK Push request ✅ (should work with real credentials)
3. M-Pesa SMS to phone ❌ (needs real passkey + callback)
4. Callback processing ❌ (needs callback endpoint)
