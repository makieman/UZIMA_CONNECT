# Google Cloud Logging Integration Guide

This guide walks you through setting up and configuring Google Cloud Logging for the Uzima Care application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up Google Cloud Project](#step-1-set-up-google-cloud-project)
3. [Step 2: Create a Service Account](#step-2-create-a-service-account)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Implement Structured Logging](#step-5-implement-structured-logging)
7. [Step 6: Deploy and Verify](#step-6-deploy-and-verify)
8. [Best Practices](#best-practices)

---

## Prerequisites

- Google Cloud Project (create one at [Google Cloud Console](https://console.cloud.google.com))
- Node.js 14+ and npm
- Access to your application's backend code
- Basic understanding of JSON and APIs

---

## Step 1: Set Up Google Cloud Project

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the **Project** dropdown at the top
3. Click **New Project**
4. Enter a project name (e.g., "uzima-care-prod")
5. Click **Create**

### 1.2 Enable the Cloud Logging API

1. In the Google Cloud Console, search for "Cloud Logging API"
2. Click on **Cloud Logging API**
3. Click **Enable**
4. Wait for the API to be enabled (1-2 minutes)

### 1.3 Find Your Project ID

1. Click the **Project** dropdown again
2. Your Project ID is displayed next to the project name (format: `uzima-care-prod`)
3. Copy this ID - you'll need it later

---

## Step 2: Create a Service Account

A service account is used to authenticate your application with Google Cloud Logging.

### 2.1 Create the Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in the service account details:
   - **Service account name**: `uzima-care-api`
   - **Service account ID**: Auto-filled (e.g., `uzima-care-api@uzima-care-prod.iam.gserviceaccount.com`)
   - **Description**: `Service account for Uzima Care API logging`
4. Click **Create and Continue**

### 2.2 Grant Permissions

1. On the "Grant this service account access to project" page:
2. Under **Select a role**, search for and select:
   - `Logging Admin` (to write logs)
   - `Monitoring Admin` (for metrics and alerting)
3. Click **Continue**
4. Click **Done**

### 2.3 Create and Download the Key

1. On the Service Accounts page, click the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** as the key type
5. Click **Create**
6. A JSON file will download - **keep this file safe and secure**
7. Rename it to `google-cloud-credentials.json`

---

## Step 3: Install Dependencies

Add the Google Cloud Logging package to your backend:

### 3.1 Install the Package

```bash
npm install @google-cloud/logging-winston
```

### 3.2 Verify Installation

Check that it appears in your `package.json`:

```json
{
  "dependencies": {
    "@google-cloud/logging-winston": "^5.0.0",
    "winston": "^3.x.x"
  }
}
```

---

## Step 4: Configure Environment Variables

### 4.1 Local Development Setup

1. Copy the `google-cloud-credentials.json` file to your backend root directory
2. Create a `.env` or `.env.local` file in your backend directory:

```env
# Google Cloud Logging Configuration
NODE_ENV=development
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json
LOG_LEVEL=info
```

Replace `your-project-id` with your actual Google Cloud Project ID.

### 4.2 Production Deployment Setup

For production (e.g., on Cloud Run, App Engine, or Compute Engine):

1. **Option A: Using Secret Manager (Recommended)**
   ```bash
   gcloud secrets create google-cloud-credentials --data-file=google-cloud-credentials.json
   ```

2. **Option B: Set Environment Variable in Deployment**
   - Upload the JSON file to your hosting platform
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to it

3. **For Docker/Container Deployment:**
   - Copy the credentials file into your container
   - Set the environment variable in your Dockerfile or deployment config

4. **Set in Production Environment:**
   ```env
   NODE_ENV=production
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials/google-cloud-credentials.json
   LOG_LEVEL=info
   ```

---

## Step 5: Implement Structured Logging

### 5.1 The Enhanced Logger

Your logger has been updated in `backend/src/utils/logger.js` to automatically send logs to Google Cloud Logging when:
- `NODE_ENV=production`
- `GOOGLE_CLOUD_PROJECT` is set

### 5.2 Using Structured Logging Helpers

Import and use the structured logging helpers in your code:

```javascript
const { 
  logAuthEvent, 
  logPaymentEvent, 
  logError 
} = require('../utils/structuredLogging');

// Log authentication
logAuthEvent('LOGIN', 'user@example.com', {
  device: 'mobile',
  ipAddress: '192.168.1.1'
});

// Log payment
logPaymentEvent('STK_PUSH', {
  amount: 500,
  phone: '254712345678',
  referralId: '123abc'
});

// Log errors
logError('PAYMENT_FAILED', new Error('Insufficient funds'), {
  phone: '254712345678',
  amount: 500
});
```

### 5.3 Integration Points

Add logging at these critical points:

**Authentication (convex/auth.ts):**
```typescript
import { logAuthEvent, logError } from '../backend/src/utils/structuredLogging';

// Before sign in
logAuthEvent('ATTEMPTED', email);

// On successful login
logAuthEvent('LOGIN', userId, { email });

// On failed login
logError('LOGIN_FAILED', new Error(reason), { email });
```

**Payments (convex/mpesa.ts, payments.ts):**
```typescript
import { logPaymentEvent, logStkPush, logPaymentCallback } from '../backend/src/utils/structuredLogging';

// Before STK push
logStkPush(phoneNumber, amount, referralId, 'INITIATED');

// After STK push
logStkPush(phoneNumber, amount, referralId, 'SENT');

// On callback
logPaymentCallback(callbackData);
```

See `LOGGING_AUTH_EXAMPLES.md` and `LOGGING_PAYMENT_EXAMPLES.md` for detailed examples.

---

## Step 6: Deploy and Verify

### 6.1 Test Locally

1. Set up your `.env` file with test credentials
2. Run your application:
   ```bash
   npm run dev:backend
   ```
3. Trigger some events (login, payments)
4. Check Google Cloud Console → Cloud Logging → Logs Explorer

### 6.2 Deploy to Production

1. Set environment variables in your production environment
2. Deploy your application to your hosting platform
3. Generate some production events

### 6.3 Verify Logs in Google Cloud Console

1. Go to Google Cloud Console
2. Navigate to **Cloud Logging** → **Logs Explorer**
3. Filter by your service name:
   ```
   resource.type="gae_app"
   jsonPayload.service="uzimacare-api"
   ```
4. You should see your application's logs with structured fields

---

## Best Practices

### 1. Sensitive Data Masking

Always mask sensitive information in logs:

```javascript
// ✅ Good: Masked
logAuthEvent('LOGIN', 'user@example.com', {
  phone: phoneNumber.replace(/\d(?=\d{2})/g, '*') // 254712***678
});

// ❌ Bad: Unmasked
logAuthEvent('LOGIN', 'user@example.com', {
  phone: phoneNumber // 254712345678
});
```

### 2. Consistent Log Structure

Use the provided helper functions to ensure consistent logging:

```javascript
// ✅ Good: Using helpers
logPaymentEvent('STK_PUSH', { phone, amount, referralId });

// ❌ Bad: Inconsistent structure
logger.info('Payment', { p: phone, a: amount });
```

### 3. Appropriate Log Levels

```javascript
logger.log('debug', { message: 'Processing started' });      // Debug info
logger.log('info', { message: 'Payment received' });        // Important events
logger.log('warn', { message: 'Retry attempt 2 of 3' });    // Warnings
logger.log('error', { message: 'Payment failed' });         // Errors
```

### 4. Include Context

Always include relevant context for debugging:

```javascript
logPaymentEvent('COMPLETED', {
  transactionCode: txnCode,
  amount: amount,
  duration: responseTime,
  mpesaReceiptNumber: receipt,
  userId: userId  // Track which user made the payment
});
```

### 5. Performance Considerations

- Logging is asynchronous and won't block your application
- Google Cloud Logging charges for ingestion - avoid logging sensitive raw data
- Use `LOG_LEVEL=warn` in production to reduce log volume and costs

### 6. Security

- **Never commit** `google-cloud-credentials.json` to version control
- Add to `.gitignore`:
  ```
  google-cloud-credentials.json
  .env
  .env.local
  ```
- Rotate service account keys regularly
- Use Secret Manager for credentials in production

---

## Troubleshooting

### Logs Not Appearing in Google Cloud Console

1. **Check environment variables:**
   ```bash
   echo $GOOGLE_CLOUD_PROJECT
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

2. **Verify credentials file:**
   - Ensure `google-cloud-credentials.json` exists in the path specified
   - Check file permissions (should be readable)

3. **Check API is enabled:**
   - Go to Google Cloud Console → APIs & Services
   - Search for "Cloud Logging API"
   - Verify it's enabled

4. **Check service account permissions:**
   - Go to IAM & Admin
   - Verify your service account has "Logging Admin" role

5. **View application logs:**
   ```bash
   npm run dev:backend 2>&1 | grep -i "cloud\|logging\|error"
   ```

### High Costs

- Reduce `LOG_LEVEL` to `warn` instead of `info`
- Filter out verbose logs using label filters
- Archive old logs to Cloud Storage

### Permission Errors

If you see permission errors:

1. Go to **IAM & Admin** → **Service Accounts**
2. Click your service account
3. Go to **Permissions** tab
4. Ensure it has:
   - `roles/logging.logWriter`
   - `roles/monitoring.metricWriter` (for alerts)

---

## Next Steps

- [Configure Google Cloud Monitoring and Alerts](./GOOGLE_CLOUD_MONITORING.md)
- [View Logs in Cloud Console](https://console.cloud.google.com/logs/query)
- [Create Custom Metrics and Dashboards](./CUSTOM_DASHBOARDS.md)

---

## Additional Resources

- [Google Cloud Logging Documentation](https://cloud.google.com/logging/docs)
- [Winston Logging for Node.js](https://github.com/winstonjs/winston)
- [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs)
