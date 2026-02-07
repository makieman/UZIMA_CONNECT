# Google Cloud Logging - Quick Start Implementation

This is a quick reference for implementing structured logging in your code.

## Installation (Step 1)

```bash
# In your Backend directory
npm install @google-cloud/logging-winston
```

## Environment Setup (Step 2)

### Development (.env.local)
```env
NODE_ENV=development
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json
LOG_LEVEL=info
```

### Production (Environment Variables)
```env
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-cloud-credentials.json
LOG_LEVEL=info
```

## Quick Integration Examples

### 1. Authentication Logging

**File:** `convex/auth.ts`

```typescript
import { logAuthEvent, logError } from '../backend/src/utils/structuredLogging';

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    try {
      // Your sign in logic
      const user = await authenticateUser(args.email, args.password);
      
      // Log successful login
      logAuthEvent('LOGIN', args.email, {
        userId: user._id,
        timestamp: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      // Log failed login
      logError('LOGIN_FAILED', error, {
        email: args.email
      });
      throw error;
    }
  }
});
```

### 2. Payment Logging

**File:** `convex/mpesa.ts`

```typescript
import { logPaymentEvent, logError, logStkPush } from '../backend/src/utils/structuredLogging';

export const initiateSTKPush = action({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      // Log STK initiation
      logStkPush(args.phoneNumber, args.amount, args.referralId, 'INITIATED');
      
      // Your STK push logic
      const result = await daraja.stkPush({
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        accountRef: `REF_${args.referralId}`
      });
      
      // Log successful push
      logStkPush(args.phoneNumber, args.amount, args.referralId, 'SENT');
      
      return result;
    } catch (error) {
      // Log error
      logError('STK_PUSH_FAILED', error, {
        phone: args.phoneNumber,
        amount: args.amount,
        referralId: args.referralId
      });
      throw error;
    }
  }
});
```

### 3. Payment Callback Logging

**File:** `convex/mpesaCallbacks.ts`

```typescript
import { logPaymentEvent, logError } from '../backend/src/utils/structuredLogging';

export const handlePaymentCallback = action({
  args: { callbackData: v.any() },
  handler: async (ctx, args) => {
    try {
      const { Body } = args.callbackData;
      const { stkCallback } = Body;
      const { ResultCode, CallbackMetadata } = stkCallback;
      
      // Log callback received
      logPaymentEvent('CALLBACK_RECEIVED', {
        resultCode: ResultCode,
        success: ResultCode === 0
      });
      
      if (ResultCode === 0) {
        // Extract transaction details
        const metadata = CallbackMetadata.Item;
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        
        // Log successful payment
        logPaymentEvent('COMPLETED', {
          amount: amount,
          resultCode: ResultCode
        });
        
        // Update database
        // ...
      } else {
        // Log failed payment
        logPaymentEvent('FAILED', {
          resultCode: ResultCode,
          error: stkCallback.ResultDesc
        });
      }
      
      return { success: true };
    } catch (error) {
      logError('CALLBACK_PROCESSING_ERROR', error, {
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
});
```

## Log Queries in Google Cloud Console

### View Payment Events
```
resource.type="global"
jsonPayload.labels.event_type="PAYMENT"
```

### View Authentication Events
```
resource.type="global"
jsonPayload.labels.event_type="AUTHENTICATION"
```

### View Errors
```
resource.type="global"
severity="ERROR"
```

### View Specific User Activity
```
resource.type="global"
jsonPayload.userId="user-id-here"
```

### View Failed Payments
```
resource.type="global"
jsonPayload.labels.action="PAYMENT_FAILED"
```

### View High-Value Transactions
```
resource.type="global"
jsonPayload.labels.event_type="PAYMENT"
jsonPayload.amount > 5000
```

## Performance Tips

### Only Log What Matters
```javascript
// ✅ Good: Only critical events
logAuthEvent('LOGIN', email);

// ❌ Bad: Every action
logUserActivity('VIEWED_PAGE', userId);
logUserActivity('CLICKED_BUTTON', userId);
logUserActivity('MOVED_MOUSE', userId);
```

### Mask Sensitive Data
```javascript
// ✅ Good
phone: '254712***678',
amount: 500,
email: 'u***@example.com'

// ❌ Bad
phone: '254712345678',
amount: 500,
email: 'user@example.com'
```

### Use Appropriate Log Levels
```javascript
logger.log('debug', { ... })   // Development only
logger.log('info', { ... })    // Important events
logger.log('warn', { ... })    // Warnings
logger.log('error', { ... })   // Errors
```

## Testing Locally

### 1. Start Development Server
```bash
npm run dev:backend
```

### 2. Trigger Events
- Log in with test account
- Make a test payment
- Check console output

### 3. View Logs Locally
```bash
# Check console output for structured JSON logs
npm run dev:backend 2>&1 | grep "PAYMENT\|AUTH\|ERROR"
```

## Production Verification

### 1. Deploy to Production
```bash
# Set environment variables
export NODE_ENV=production
export GOOGLE_CLOUD_PROJECT=your-project-id

# Deploy
npm run build
gcloud app deploy
```

### 2. Verify Logs in Google Cloud
```
1. Go to: https://console.cloud.google.com/logs/query
2. Filter by: jsonPayload.service="uzimacare-api"
3. You should see your logs appearing in real-time
```

### 3. Create Dashboard
```
1. Go to Cloud Monitoring → Dashboards
2. Create new dashboard
3. Add widgets for key metrics:
   - Payment success rate
   - Login success rate
   - Error count
```

### 4. Set Up Alerts
```
1. Go to Cloud Monitoring → Alerting
2. Create alert for payment failures
3. Create alert for auth failures
4. Add email/Slack notifications
```

## Helper Functions Quick Reference

```javascript
// Authentication logging
logAuthEvent('LOGIN', email, { userId, device });
logAuthEvent('LOGOUT', userId);
logAuthEvent('SIGNUP', email, { fullName });

// Payment logging
logPaymentEvent('STK_PUSH', { phone, amount, referralId });
logPaymentEvent('CALLBACK_RECEIVED', { resultCode, amount });
logPaymentEvent('COMPLETED', { amount, mpesaReceipt });
logPaymentEvent('FAILED', { amount, error });

// STK specific
logStkPush(phone, amount, referralId, 'INITIATED');
logStkPush(phone, amount, referralId, 'SENT');
logStkPush(phone, amount, referralId, 'TIMEOUT');

// Callback
logPaymentCallback(callbackData);

// User activity
logUserActivity('VIEWED_BOOKINGS', userId, { count: 5 });
logUserActivity('CREATED_REFERRAL', userId, { referralId });

// Errors
logError('PAYMENT_API_ERROR', error, { phone, amount });
logError('DB_CONNECTION_ERROR', error, { retries: 3 });

// API calls
logApiCall('/api/payments', 'POST', 200, 150, userId);

// Database operations
logDatabaseOperation('INSERT', 'payments', 45, true);
logDatabaseOperation('UPDATE', 'users', 30, true);

// External service calls
logExternalServiceCall('DARAJA', '/generate_token', 200, 200);
```

## Checklist

- [ ] Install `@google-cloud/logging-winston`
- [ ] Create Google Cloud Project
- [ ] Create Service Account and download credentials
- [ ] Set environment variables locally
- [ ] Update logger.js with Google Cloud integration
- [ ] Add logging to auth endpoints
- [ ] Add logging to payment endpoints
- [ ] Add logging to payment callbacks
- [ ] Test locally with auth and payment events
- [ ] Deploy to production
- [ ] Verify logs appear in Google Cloud Console
- [ ] Create dashboards and alerts
- [ ] Configure team notifications

## Resources

- [Full Setup Guide](./GOOGLE_CLOUD_LOGGING_SETUP.md)
- [Monitoring & Alerts Guide](./GOOGLE_CLOUD_MONITORING_ALERTS.md)
- [Auth Examples](./convex/LOGGING_AUTH_EXAMPLES.md)
- [Payment Examples](./convex/LOGGING_PAYMENT_EXAMPLES.md)
