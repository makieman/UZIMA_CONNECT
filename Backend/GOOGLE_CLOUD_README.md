# Google Cloud Logging Integration - Complete Implementation Guide

Welcome! This directory contains everything you need to implement structured logging and Google Cloud Logging for the Uzima Care application.

## 📋 Quick Overview

This integration provides:
- **Structured Logging**: Consistent, machine-readable log format
- **Google Cloud Logging**: Centralized log storage and analysis
- **Real-time Monitoring**: Track key metrics and events
- **Intelligent Alerting**: Get notified of issues automatically
- **Better Debugging**: Detailed context for every log entry

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install @google-cloud/logging-winston
```

### Step 2: Set Up Google Cloud Account
See [GOOGLE_CLOUD_LOGGING_SETUP.md](./GOOGLE_CLOUD_LOGGING_SETUP.md)

### Step 3: Add Environment Variables
```env
NODE_ENV=development
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json
```

### Step 4: Start Using Logging
See [GOOGLE_CLOUD_QUICK_START.md](./GOOGLE_CLOUD_QUICK_START.md) for code examples

## 📚 Documentation Files

### Essential Setup
- **[GOOGLE_CLOUD_QUICK_START.md](./GOOGLE_CLOUD_QUICK_START.md)** - Fast implementation guide with examples
- **[GOOGLE_CLOUD_LOGGING_SETUP.md](./GOOGLE_CLOUD_LOGGING_SETUP.md)** - Complete setup walkthrough
- **[INSTALL_GOOGLE_CLOUD_PACKAGE.md](./INSTALL_GOOGLE_CLOUD_PACKAGE.md)** - Package installation guide

### Code Examples
- **[convex/LOGGING_AUTH_EXAMPLES.md](./convex/LOGGING_AUTH_EXAMPLES.md)** - How to log authentication events
- **[convex/LOGGING_PAYMENT_EXAMPLES.md](./convex/LOGGING_PAYMENT_EXAMPLES.md)** - How to log payment events

### Advanced Configuration
- **[GOOGLE_CLOUD_MONITORING_ALERTS.md](./GOOGLE_CLOUD_MONITORING_ALERTS.md)** - Set up dashboards and alerts

### Updated Components
- **[backend/src/utils/logger.js](./backend/src/utils/logger.js)** - Enhanced logger with Google Cloud integration
- **[backend/src/utils/structuredLogging.js](./backend/src/utils/structuredLogging.js)** - Structured logging helper functions

## 🎯 What Gets Logged

### Authentication Events
```
- Login attempts (success/failure)
- Logout events
- Registration/signup
- Permission changes
- Password reset
```

### Payment Events
```
- STK push initiation
- Payment callback received
- Payment completion/failure
- Refunds processed
- M-Pesa API calls
```

### System Events
```
- API calls with response times
- Database operations
- External service calls
- Error conditions
- Performance metrics
```

## 📊 Architecture

```
Your Application
        ↓
    logger.js (Winston)
        ↓
    ├─ Local Files (logs/)
    ├─ Console (development)
    └─ Google Cloud Logging (production)
        ↓
Google Cloud Console
        ↓
    ├─ Logs Explorer
    ├─ Custom Metrics
    ├─ Dashboards
    └─ Alerts
```

## 🔍 Key Features

### 1. Structured Logging Format
All logs include:
- Timestamp
- Event type
- Severity level
- Custom labels
- Contextual data
- Sensitive data masking

Example log:
```json
{
  "timestamp": "2024-02-06T10:30:45Z",
  "message": "AUTH_LOGIN_SUCCESS",
  "event": "LOGIN",
  "severity": "INFO",
  "labels": {
    "event_type": "AUTHENTICATION",
    "action": "LOGIN"
  },
  "userId": "user123",
  "email": "user@example.com"
}
```

### 2. Helper Functions
Easy-to-use functions for common logging scenarios:

```javascript
// Authentication
logAuthEvent('LOGIN', email, { userId, device });

// Payments
logPaymentEvent('STK_PUSH', { phone, amount, referralId });
logStkPush(phone, amount, referralId, 'SENT');

// Errors
logError('STK_PUSH_FAILED', error, { phone, amount });
```

### 3. Automatic Masking
Sensitive data is automatically masked:
- Phone: `254712***678`
- Email: `user***@example.com`
- Credit cards: `****1234`

### 4. Google Cloud Integration
In production, all logs automatically:
- Send to Google Cloud Logging
- Appear in Cloud Console
- Create metrics and dashboards
- Trigger alerts

## 🛠️ Implementation Checklist

- [ ] **Install Dependencies**
  - [ ] Install `@google-cloud/logging-winston`
  
- [ ] **Google Cloud Setup**
  - [ ] Create Google Cloud Project
  - [ ] Enable Cloud Logging API
  - [ ] Create service account
  - [ ] Download credentials JSON
  
- [ ] **Local Configuration**
  - [ ] Add credentials file to project
  - [ ] Create `.env.local` with environment variables
  - [ ] Test locally with sample logs
  
- [ ] **Code Integration**
  - [ ] Add logging to auth flows (login, signup, logout)
  - [ ] Add logging to payment flows (STK, callbacks)
  - [ ] Add error logging throughout app
  - [ ] Add performance logging to critical paths
  
- [ ] **Production Setup**
  - [ ] Configure production environment variables
  - [ ] Deploy application
  - [ ] Verify logs in Google Cloud Console
  
- [ ] **Monitoring & Alerts**
  - [ ] Create custom metrics
  - [ ] Set up dashboards
  - [ ] Configure alert policies
  - [ ] Set up notification channels
  - [ ] Test alert system

## 📈 Typical Log Volumes

For reference, typical applications log:

```
Development:    10-100 logs/minute  (console + file)
Production:     100-1000 logs/minute (Google Cloud)
```

Costs are reasonable for most applications (~$0.50/month to $5/month for typical usage).

## 🔐 Security Considerations

### Credentials Management
- Never commit `google-cloud-credentials.json`
- Add to `.gitignore`
- Use Secret Manager for production
- Rotate keys regularly

### Sensitive Data
- Always mask PII (phone, email, IDs)
- Don't log passwords or tokens
- Sanitize user inputs
- Use log filters to prevent leaks

### Access Control
- Service account has minimal permissions
- Only "Logging" roles assigned
- Separate accounts for dev/prod
- Audit access regularly

## 🧪 Testing

### Local Testing
```bash
# Start development server
npm run dev:backend

# Trigger test events
# - Try logging in
# - Make test payment
# - Check console output
```

### Google Cloud Testing
```bash
# Set environment variables
export NODE_ENV=production
export GOOGLE_CLOUD_PROJECT=your-project-id

# Deploy and test
npm run build
gcloud app deploy

# View logs
# Go to: https://console.cloud.google.com/logs/query
# Filter: jsonPayload.service="uzimacare-api"
```

## 📞 Support & Resources

### Troubleshooting
1. Logs not appearing? → See GOOGLE_CLOUD_LOGGING_SETUP.md → Troubleshooting
2. High costs? → Check log level and volume
3. Alerts not firing? → See GOOGLE_CLOUD_MONITORING_ALERTS.md → Troubleshooting

### Official Documentation
- [Google Cloud Logging](https://cloud.google.com/logging/docs)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Google Cloud Monitoring](https://cloud.google.com/monitoring/docs)

### Quick Links
- [Google Cloud Console](https://console.cloud.google.com)
- [Logs Explorer](https://console.cloud.google.com/logs/query)
- [Monitoring Dashboards](https://console.cloud.google.com/monitoring/dashboards)
- [Alerting Policies](https://console.cloud.google.com/monitoring/alerting/policies)

## 📝 File Structure

```
Backend/
├── backend/
│   └── src/
│       └── utils/
│           ├── logger.js                    (Enhanced logger)
│           └── structuredLogging.js         (Helper functions)
├── convex/
│   ├── LOGGING_AUTH_EXAMPLES.md            (Auth examples)
│   └── LOGGING_PAYMENT_EXAMPLES.md         (Payment examples)
├── GOOGLE_CLOUD_LOGGING_SETUP.md           (Full setup guide)
├── GOOGLE_CLOUD_MONITORING_ALERTS.md       (Alerts guide)
├── GOOGLE_CLOUD_QUICK_START.md             (Quick reference)
├── INSTALL_GOOGLE_CLOUD_PACKAGE.md         (Package installation)
└── README.md                                (This file)
```

## ✅ Next Steps

1. **Start with**: [GOOGLE_CLOUD_QUICK_START.md](./GOOGLE_CLOUD_QUICK_START.md)
2. **Then follow**: [GOOGLE_CLOUD_LOGGING_SETUP.md](./GOOGLE_CLOUD_LOGGING_SETUP.md)
3. **Look at examples**: [convex/LOGGING_AUTH_EXAMPLES.md](./convex/LOGGING_AUTH_EXAMPLES.md)
4. **Set up alerts**: [GOOGLE_CLOUD_MONITORING_ALERTS.md](./GOOGLE_CLOUD_MONITORING_ALERTS.md)

## 💡 Tips for Success

### Best Practices
✅ Do:
- Use consistent log structure
- Mask sensitive data
- Include context in logs
- Set up meaningful alerts
- Monitor log costs
- Review logs regularly

❌ Don't:
- Log passwords or tokens
- Commit credentials to git
- Over-log (everything)
- Ignore alert fatigue
- Skip error handling
- Leave alerts unconfigured

### Integration Strategy
1. Start with auth and payment logging (highest value)
2. Test thoroughly in development
3. Deploy to production incrementally
4. Monitor for issues in first week
5. Expand to other areas (user activity, performance)
6. Refine based on what you learn

## 📊 Example Queries

### Most Common Logs
```
resource.type="global"
jsonPayload.service="uzimacare-api"
severity in ("INFO", "WARNING", "ERROR")
```

### Payment Success Rate
```
resource.type="global"
jsonPayload.labels.event_type="PAYMENT"
jsonPayload.labels.action="COMPLETED"
```

### Failed Logins
```
resource.type="global"
jsonPayload.labels.action="LOGIN_FAILED"
timestamp >= "2024-02-06T00:00:00Z"
```

### High-Value Transactions
```
resource.type="global"
jsonPayload.labels.event_type="PAYMENT"
jsonPayload.amount > 10000
```

---

**Version**: 1.0  
**Last Updated**: February 6, 2024  
**Status**: Ready for Implementation
