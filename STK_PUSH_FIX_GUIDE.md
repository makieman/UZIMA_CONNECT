# STK Push Not Working - Diagnosis & Fix

## 🔴 **ROOT CAUSE IDENTIFIED**

Your STK push is **NOT being sent** because the frontend code is only **simulating** the M-Pesa payment, not actually calling the API.

### Current Code (Line 82-83 in pending-physician-referrals.tsx):
```typescript
// Simulation: Increment STK count
await incrementStk({ referralId: selectedReferral._id, demoUserId: user?.id });
```

**This only updates a counter in the database - NO API call is made to M-Pesa!**

---

## ✅ **THE FIX**

### Step 1: Add M-Pesa Credentials

Add these to `uzimacare_convex_backend/.env.local`:

```env
# M-Pesa Daraja API Credentials
DARAJA_CONSUMER_KEY=your_consumer_key_here
DARAJA_CONSUMER_SECRET=your_consumer_secret_here
DARAJA_SHORTCODE=174379  # Sandbox shortcode
DARAJA_PASSKEY=your_passkey_here
DARAJA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

**Get these from:** https://developer.safaricom.co.ke/

---

### Step 2: Update Frontend Code

Replace lines 82-83 in `pending-physician-referrals.tsx` with:

```typescript
// ACTUAL M-PESA STK PUSH API CALL
console.log("Calling M-Pesa STK Push...");
const mpesaResponse = await callMpesaStk({
  phoneNumber: biodataForm.stkPhoneNumber,
  amount: 50, // KSH 50 payment
  referralId: selectedReferral._id,
  patientName: selectedReferral.patientName,
  useTestCallback: false
});

console.log("M-Pesa Response:", mpesaResponse);

// Increment STK count
await incrementStk({ referralId: selectedReferral._id, demoUserId: user?.id });

// Check if STK was successful
if (mpesaResponse.success) {
  alert(`✅ STK sent to ${biodataForm.stkPhoneNumber}!`);
} else {
  alert(`⚠️ STK failed: ${mpesaResponse.error || 'Unknown error'}`);
}
```

---

## 📋 **CHECKLIST TO GET STK WORKING**

### ✅ 1. Environment Variables
- [ ] Add `DARAJA_CONSUMER_KEY` to `.env.local`
- [ ] Add `DARAJA_CONSUMER_SECRET` to `.env.local`
- [ ] Add `DARAJA_SHORTCODE` to `.env.local`
- [ ] Add `DARAJA_PASSKEY` to `.env.local`
- [ ] Add `DARAJA_CALLBACK_URL` to `.env.local`
- [ ] Restart `npx convex dev` after adding variables

### ✅ 2. Phone Number Format
- [ ] Use format: `254XXXXXXXXX` (no `+` or `0`)
- [ ] Example: `254748623870` ✅
- [ ] NOT: `+254748623870` ❌
- [ ] NOT: `0748623870` ❌

### ✅ 3. Sandbox vs Production
- [ ] **Sandbox**: Only works with Safaricom test numbers
- [ ] **Production**: Works with real Kenyan M-Pesa numbers
- [ ] Get test credentials from: https://developer.safaricom.co.ke/

### ✅ 4. Code Changes
- [ ] Import `useAction` in component
- [ ] Add `const callMpesaStk = useAction(api.mpesaApi.callMpesaStkPush);`
- [ ] Replace simulation code with actual API call
- [ ] Add proper error handling

---

## 🧪 **TEST THE FIX**

### Option 1: Use Debug Function
```typescript
// In browser console or create a test button:
const result = await callMpesaStk({
  phoneNumber: "254XXXXXXXXX", // Your test number
  amount: 1,
  referralId: "test-ref-id",
  patientName: "Test Patient",
  useTestCallback: true
});
console.log(result);
```

### Option 2: Check Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Trigger STK push
4. Look for:
   - "Calling M-Pesa STK Push..."
   - "M-Pesa Response: {...}"
   - Any error messages

---

## 🚨 **COMMON ERRORS & SOLUTIONS**

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required environment variables" | No M-Pesa credentials | Add to `.env.local` and restart Convex |
| "Invalid Access Token" | Wrong consumer key/secret | Double-check credentials from Daraja portal |
| "Invalid Phone Number" | Wrong format | Use `254XXXXXXXXX` format |
| "The service request is processed successfully" but no prompt | Using sandbox with real number | Use test number or switch to production |
| "Request timeout" | Network/API issue | Retry or check Safaricom API status |

---

## 📞 **NEXT STEPS**

1. **Get M-Pesa Credentials**: Sign up at https://developer.safaricom.co.ke/
2. **Add to `.env.local`**: Copy credentials to environment file
3. **Update Frontend Code**: Replace simulation with actual API call
4. **Test**: Try sending STK to a test number
5. **Monitor Logs**: Check browser console for responses

---

## 💡 **WHY IT WASN'T WORKING**

```
❌ OLD FLOW:
User clicks "Send STK" → Only increment counter → Show fake success message

✅ NEW FLOW:
User clicks "Send STK" → Call M-Pesa API → Get real response → Show actual status
```

The M-Pesa API functions (`mpesaApi.ts`, `mpesa.ts`) were already created but **never called** from the frontend!

