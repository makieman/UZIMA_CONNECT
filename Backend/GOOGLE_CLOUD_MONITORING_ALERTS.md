# Google Cloud Monitoring and Alerting Guide

This guide explains how to set up monitoring, metrics, and alerts for the Uzima Care application using Google Cloud Monitoring.

## Table of Contents

1. [Overview](#overview)
2. [Create Custom Metrics](#create-custom-metrics)
3. [Set Up Dashboards](#set-up-dashboards)
4. [Configure Alerting Policies](#configure-alerting-policies)
5. [Common Alert Scenarios](#common-alert-scenarios)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Google Cloud Monitoring helps you:
- Track custom metrics from your logs (e.g., payment success rate)
- Create dashboards to visualize key metrics
- Set up alerts to notify you of issues
- Monitor performance and user behavior

**Prerequisites:**
- Google Cloud Logging is set up (see `GOOGLE_CLOUD_LOGGING_SETUP.md`)
- Your service account has "Monitoring Admin" role

---

## Create Custom Metrics

Custom metrics let you track application-specific events from your logs.

### 2.1 Create a Payment Success Rate Metric

1. Go to **Cloud Monitoring** → **Metrics Explorer**
2. Click **Create Metric**
3. Fill in the details:
   - **Metric type name**: `custom.googleapis.com/payment/success_rate`
   - **Display name**: `Payment Success Rate`
   - **Description**: `Percentage of successful payment attempts`
   - **Unit**: `10^2.%` (percentage)
   - **Metric kind**: `GAUGE`
   - **Value type**: `DOUBLE`
4. Click **Create Metric**

### 2.2 Create a Login Success Rate Metric

1. Click **Create Metric** again
2. Fill in:
   - **Metric type name**: `custom.googleapis.com/auth/login_success_rate`
   - **Display name**: `Login Success Rate`
   - **Description**: `Percentage of successful login attempts`
   - **Unit**: `10^2.%`
   - **Metric kind**: `GAUGE`
   - **Value type**: `DOUBLE`
3. Click **Create Metric**

### 2.3 Create a Transaction Count Metric

1. Click **Create Metric** again
2. Fill in:
   - **Metric type name**: `custom.googleapis.com/payment/transaction_count`
   - **Display name**: `Transaction Count`
   - **Description**: `Total number of payment transactions`
   - **Unit**: `1` (dimensionless)
   - **Metric kind**: `CUMULATIVE`
   - **Value type**: `INT64`
3. Click **Create Metric**

### 2.4 Create Log-Based Metrics (Automatic)

To automatically track metrics from your logs:

1. Go to **Cloud Logging** → **Logs Explorer**
2. Enter a filter for payment events:
   ```
   resource.type="global"
   jsonPayload.labels.event_type="PAYMENT"
   jsonPayload.labels.action="STK_PUSH_SENT"
   ```
3. Click the **⋮** (more) menu
4. Select **Create Metric**
5. Configure:
   - **Metric type**: `logging.googleapis.com/user_defined_metrics/payment_success`
   - **Description**: `STK Push successful attempts`
   - **Filter**: Auto-populated from your log query
6. Click **Create Metric**

---

## Set Up Dashboards

Dashboards display your metrics in real-time visualizations.

### 3.1 Create a Main Dashboard

1. Go to **Cloud Monitoring** → **Dashboards**
2. Click **Create Dashboard**
3. Enter **Dashboard name**: `Uzima Care - Overview`
4. Click **Create**

### 3.2 Add Payment Metrics Widget

1. Click **Add Widget**
2. Select **Line Chart**
3. Configure the metric:
   - **Resource type**: `Global`
   - **Metric**: `custom.googleapis.com/payment/success_rate`
4. Set chart options:
   - **Title**: `Payment Success Rate`
   - **Y-axis label**: `Success Rate (%)`
5. Click **Add**

### 3.3 Add Authentication Metrics Widget

1. Click **Add Widget**
2. Select **Line Chart**
3. Configure:
   - **Metric**: `custom.googleapis.com/auth/login_success_rate`
   - **Title**: `Login Success Rate`
4. Click **Add**

### 3.4 Add Transaction Volume Widget

1. Click **Add Widget**
2. Select **Line Chart**
3. Configure:
   - **Metric**: `custom.googleapis.com/payment/transaction_count`
   - **Title**: `Transaction Volume (24h)`
   - **Aggregation**: Sum
4. Click **Add**

### 3.5 Add Error Rate Widget

1. Click **Add Widget**
2. Select **Line Chart**
3. Create a filter-based metric:
   - **Filter**: `resource.type="global" jsonPayload.severity="ERROR"`
   - **Title**: `Error Rate`
4. Click **Add**

### Example Dashboard Layout:
```
┌─────────────────────────────────────────┐
│  Payment Success Rate    Login Success Rate
│  [Line Chart]            [Line Chart]
├─────────────────────────────────────────┤
│  Transaction Volume      Error Count
│  [Line Chart]            [Line Chart]
└─────────────────────────────────────────┘
```

---

## Configure Alerting Policies

Alerts notify you when something goes wrong.

### 4.1 Create Payment Failure Alert

1. Go to **Cloud Monitoring** → **Alerting** → **Policies**
2. Click **Create Policy**
3. **Configure Alert Condition:**
   - Click **Add Condition**
   - **Condition type**: `Metric Threshold`
   - **Resource type**: `Global`
   - **Metric**: `logging.googleapis.com/user_defined_metrics/payment_failed`
   - **Filter**: `resource.type="global"`
   - **Condition**: `is above`
   - **Threshold**: `5` (5 failed payments)
   - **For duration**: `5 minutes`
4. Click **Add Condition**

### 4.2 Create High Error Rate Alert

1. Click **Add Condition**
2. Configure:
   - **Condition type**: `Metric Threshold`
   - **Metric**: `logging.googleapis.com/user_defined_metrics/error_count`
   - **Condition**: `is above`
   - **Threshold**: `10`
   - **For duration**: `10 minutes`
3. Click **Add Condition**

### 4.3 Create Authentication Failure Alert

1. Click **Add Condition**
2. Configure:
   - **Condition type**: `Metric Threshold`
   - **Metric**: `logging.googleapis.com/user_defined_metrics/login_failed`
   - **Condition**: `is above`
   - **Threshold**: `20` (20 failed logins in 10 minutes = potential attack)
   - **For duration**: `10 minutes`
3. Click **Add Condition**

### 4.4 Set Up Notifications

1. Scroll to **Notification Channels**
2. Click **Add Notification Channel**
3. Select **Email**
4. Enter email address: `devops@uzimacare.com`
5. Click **Create Channel**
6. Select the channel you created
7. Add any additional channels (Slack, PagerDuty, etc.)

### 4.5 Set Alert Details

1. **Alert policy name**: `Payment and Auth Monitoring`
2. **Documentation**: 
   ```
   Alert triggered by payment failures or authentication issues.
   
   Actions to take:
   1. Check Google Cloud Logs for details
   2. Verify payment gateway connectivity
   3. Check API health
   4. Contact on-call engineer
   ```
3. Click **Create Policy**

---

## Common Alert Scenarios

### Scenario 1: Payment Success Rate Drops Below 80%

```
Condition:
- Metric: payment/success_rate
- Condition: below 80%
- Duration: 15 minutes
- Severity: HIGH

Action: Page oncall engineer
```

### Scenario 2: Unusual Login Failure Pattern (Potential Attack)

```
Condition:
- Metric: auth/login_failed_count
- Condition: above 50
- Duration: 5 minutes
- Severity: CRITICAL

Action: 
- Alert security team
- Consider rate limiting IP addresses
```

### Scenario 3: API Response Time Degradation

```
Condition:
- Metric: api/response_time_p95
- Condition: above 5000ms (5 seconds)
- Duration: 10 minutes
- Severity: MEDIUM

Action: Check for resource constraints
```

### Scenario 4: Database Query Errors

```
Condition:
- Metric: database/error_count
- Condition: above 5
- Duration: 5 minutes
- Severity: HIGH

Action: Check database connectivity
```

### Scenario 5: STK Push Timeout Rate

```
Condition:
- Metric: payment/stk_timeout_count
- Condition: above 10
- Duration: 10 minutes
- Severity: MEDIUM

Action: Check M-Pesa gateway status
```

---

## Best Practices

### 1. Alert Fatigue Prevention

- **Set appropriate thresholds**: Not too sensitive, not too loose
- **Use time windows**: 5-15 minutes to avoid single-event triggers
- **Require sustained conditions**: Most alerts require 5-10 minute durations

```javascript
// ✅ Good: Won't alert on every single failure
threshold: 10,
duration: 10 minutes

// ❌ Bad: Will alert on every failure
threshold: 1,
duration: 1 minute
```

### 2. Clear Alert Messages

Include actionable information:

```
Alert Message:
"High payment failure rate detected (15 failures in 10 minutes).
View logs: https://console.cloud.google.com/logs/query?query=...
Escalation: Page payment-services oncall"
```

### 3. Graduated Severity Levels

```
CRITICAL (Page immediately)
- Payment processing completely down
- Database connection lost
- Authentication system failure

HIGH (Alert within 5 minutes)
- Payment success rate < 80%
- Error rate > 5%
- Response time p95 > 5s

MEDIUM (Alert within 30 minutes)
- Payment success rate 80-90%
- Error rate 1-5%
- Response time p95 2-5s

LOW (Log only)
- Success rate > 90%
- Error rate < 1%
```

### 4. Metric Labeling

Label your metrics for better filtering:

```javascript
logger.log('info', {
  message: 'PAYMENT_STK_PUSH',
  labels: {
    event_type: 'PAYMENT',
    action: 'STK_PUSH_SENT',
    provider: 'MPESA',
    amount_range: '100-500'  // Add labels for grouping
  }
});
```

### 5. Regular Alert Review

- Review alert effectiveness monthly
- Adjust thresholds based on baseline metrics
- Disable alerts for resolved issues

---

## Troubleshooting

### Alerts Not Firing

1. **Check metric data exists:**
   ```
   Go to Cloud Monitoring → Metrics Explorer
   Search for your metric name
   Verify data is being collected
   ```

2. **Verify alert policy configuration:**
   - Check threshold value
   - Ensure metric is available in your region
   - Verify notification channels are active

3. **Check notification channel:**
   - Go to Alerting → Notification Channels
   - Click channel → **Verify Connection**
   - Check email inbox (including spam)

### Too Many False Positives

1. **Increase threshold:**
   ```
   From: 5 events in 5 minutes
   To: 20 events in 10 minutes
   ```

2. **Add more conditions:**
   ```
   Alert if:
   - Error rate > 5% AND
   - Response time > 5 seconds
   (Both conditions must be true)
   ```

3. **Use composite alerts** to correlate multiple metrics

### Metrics Not Showing Data

1. **Verify logs are being sent:**
   ```
   Cloud Logging → Logs Explorer
   Filter: jsonPayload.labels.event_type="PAYMENT"
   ```

2. **Check metric filter syntax:**
   - Use Cloud Logging query syntax
   - Test filter in Logs Explorer first

3. **Allow 5-10 minutes** for log-based metrics to populate

---

## Example Complete Alerting Setup

```yaml
Alerts:
  - Name: "Payment Service Down"
    Metric: payment/error_count
    Condition: > 50 in 5 min
    Severity: CRITICAL
    Channels: [PagerDuty, Email, Slack]

  - Name: "High Authentication Failures"
    Metric: auth/failed_login_count
    Condition: > 50 in 10 min
    Severity: HIGH
    Channels: [Email, Slack]

  - Name: "Elevated API Response Time"
    Metric: api/response_time_p95
    Condition: > 5000ms for 10 min
    Severity: MEDIUM
    Channels: [Email]

  - Name: "Database Connection Issues"
    Metric: database/error_count
    Condition: > 5 in 5 min
    Severity: HIGH
    Channels: [PagerDuty, Email]

  - Name: "Suspicious M-Pesa Activity"
    Metric: payment/stk_timeout_count
    Condition: > 20 in 10 min
    Severity: MEDIUM
    Channels: [Email]
```

---

## Next Steps

- [View and Filter Logs](https://console.cloud.google.com/logs/query)
- [Create Custom Dashboards](./CUSTOM_DASHBOARDS.md)
- [Set Up Log Archival](https://cloud.google.com/logging/docs/export)

---

## Resources

- [Google Cloud Monitoring Documentation](https://cloud.google.com/monitoring/docs)
- [Creating Alert Policies](https://cloud.google.com/monitoring/alerts/using-alert-policies)
- [Log-Based Metrics](https://cloud.google.com/logging/docs/logs-based-metrics)
- [Custom Metrics](https://cloud.google.com/monitoring/custom-metrics)
