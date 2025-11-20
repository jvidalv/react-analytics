# Privacy & Data Collection

## Overview

React Analytics is designed with privacy in mind. This document explains what data is collected, how it's stored, and the privacy features built into the platform.

## Privacy-First Design Principles

### 1. Self-Hosted Architecture
- **Your Infrastructure**: All data stays on your servers
- **No Third-Party Sharing**: Zero data sharing by design
- **Complete Control**: You own and control all analytics data
- **Data Sovereignty**: Host in any region (EU, US, etc.) to meet legal requirements

### 2. Open Source & Transparent
- **Fully Auditable**: All code is open source and reviewable
- **No Hidden Tracking**: Exactly what you see is what's collected
- **Community Verified**: Open to security audits and contributions

### 3. Configurable Data Collection
- **Opt-In Identity Tracking**: Name/email only collected if you explicitly call `identify()`
- **Disable Event Types**: Turn off navigation or state tracking
- **Minimal Data**: Only collects what you explicitly send

## Data Collection Details

### Automatically Collected Data

When you initialize the analytics library, the following data is collected **automatically** for all events:

| Data Point | Description | Example | Personally Identifiable |
|------------|-------------|---------|------------------------|
| **Identify ID** | UUID v7 for device identification | `01999014-3631-7bc1-a342-c8cacc1d4840` | No (pseudonymous) |
| **Timestamp** | When the event occurred | `2025-01-19T15:30:00Z` | No |
| **Platform** | Device platform | `ios`, `android`, `web` | No |
| **App Version** | Your app version | `1.2.3` | No |
| **User Agent** | Browser/device info (web only) | `Mozilla/5.0...` | No (but can fingerprint) |
| **Country** | Derived from IP (if enabled) | `ES`, `US` | No (geographic only) |

**Note**: IP addresses are NOT stored by default.

### Event-Specific Data

Different event types collect different data:

#### Navigation Events (`type: "navigation"`)
```typescript
analytics.navigation('/dashboard', { referrer: '/home' });
```
- **Path**: The navigation destination
- **Properties**: Optional metadata you provide

#### Action Events (`type: "action"`)
```typescript
analytics.action('button-clicked', { buttonId: 'signup' });
```
- **Action Name**: The action identifier
- **Properties**: Optional metadata you provide

#### State Events (`type: "state"`)
```typescript
analytics.state('app-open');
analytics.state('app-background');
```
- **State**: The app state change

#### Error Events (`type: "error"`)
```typescript
analytics.error(new Error('API failed'), { endpoint: '/api/users' });
```
- **Error Message**: The error text
- **Stack Trace**: Where the error occurred
- **Properties**: Optional context you provide

### Opt-In Identity Data (PII)

The following data is **ONLY** collected if you explicitly call `analytics.identify()`:

| Data Point | Required | Collected When | GDPR Category |
|------------|----------|----------------|---------------|
| **User ID** | Yes | `identify()` called | Personal Data |
| **Email** | No | You pass it to `identify()` | Personal Data |
| **Name** | No | You pass it to `identify()` | Personal Data |
| **Avatar URL** | No | You pass it to `identify()` | Personal Data (if identifiable) |
| **Custom Properties** | No | You pass them to `identify()` | Depends on content |

**Example:**
```typescript
// This collects PII - requires user consent!
analytics.identify('user-123', {
  email: 'user@example.com',      // PII
  name: 'John Doe',                // PII
  avatarUrl: 'https://...',        // Potentially PII
  subscription: 'premium'           // Non-PII metadata
});
```

⚠️ **GDPR Warning**: Collecting name, email, or other identifiable information requires explicit user consent under GDPR. See [GDPR.md](./GDPR.md) for implementation guidance.

## Data Storage

### Local Storage (Client-Side)

The library stores minimal data locally:

| Storage Key | Purpose | Expires | Contains PII |
|-------------|---------|---------|--------------|
| `analytics-identify-id` | Device UUID | Never | No |
| `analytics-user-id` | User ID (if identified) | On logout | Potentially |
| `analytics-batch` | Pending events | 5 seconds | Depends on events |

**Platform-Specific Storage:**
- **Web**: `localStorage` (persistent across sessions)
- **React Native/Expo**: `AsyncStorage` (persistent across app launches)

### Server-Side Storage (Database)

All analytics data is stored in PostgreSQL:

**Tables:**
- `analytics` - Production events
- `analytics_test` - Test/development events
- `analytics_identified_users_mv` - Materialized view of identified users
- `analytics_test_identified_users_mv` - Materialized view of test users

**Data Retention:**
- **Default**: Indefinite (no automatic deletion)
- **Your Responsibility**: Implement data retention policies
- **Recommendation**: Delete data after 13-26 months
- See [GDPR.md](./GDPR.md) for retention implementation examples

## Privacy Features

### 1. UUID-Based Tracking (Not Cookie-Based)
- Uses UUID v7 instead of traditional cookies
- Stored in localStorage/AsyncStorage (not sent in HTTP headers)
- No automatic cross-site tracking
- Easy to clear (user deletes localStorage)

### 2. Event Batching
- Events batched for 5 seconds before sending
- Reduces network exposure
- Configurable interval

```typescript
analytics.init({
  apiKey: 'your-key',
  batchInterval: 10000 // 10 seconds
});
```

### 3. Configurable Event Collection

Disable specific event types:

```typescript
analytics.init({
  apiKey: 'your-key',
  events: {
    disableStateEvents: true, // Don't track app state
  }
});
```

### 4. Test Mode

Separate test and production data:

```typescript
analytics.init({
  apiKey: 'your-key',
  isTest: true // Uses analytics_test table
});
```

### 5. Custom API Endpoint

Host analytics in your preferred region:

```typescript
analytics.init({
  apiKey: 'your-key',
  url: 'https://analytics.eu.yourdomain.com/api/analytics'
});
```

### 6. No External Dependencies
- All processing happens on your servers
- No third-party analytics services
- No CDN dependencies
- No external API calls

## Privacy Best Practices

### 1. Minimize Data Collection
```typescript
// ✅ Good: Only collect what you need
analytics.navigation('/dashboard');

// ❌ Avoid: Collecting unnecessary PII
analytics.action('click', {
  socialSecurityNumber: '...' // Never do this!
});
```

### 2. Anonymize When Possible
```typescript
// ✅ Good: Use non-identifiable IDs
analytics.identify('user-uuid-123');

// ⚠️ Requires Consent: Identifiable information
analytics.identify('user-uuid-123', {
  email: 'user@example.com'
});
```

### 3. Use Test Mode During Development
```typescript
// Development
analytics.init({
  apiKey: 'your-test-key',
  isTest: true
});

// Production
analytics.init({
  apiKey: 'your-prod-key',
  isTest: false
});
```

### 4. Implement Data Deletion
Provide users ability to delete their data:

```typescript
// API endpoint example
await db.delete(analytics)
  .where(eq(analytics.userId, userId));
```

### 5. Respect Do Not Track
```typescript
if (navigator.doNotTrack === '1') {
  // Don't initialize analytics
}
```

## Comparison with SaaS Analytics

| Feature | React Analytics | Google Analytics | Mixpanel | Plausible |
|---------|----------------|------------------|----------|-----------|
| **Data Location** | Your servers | Google servers | Mixpanel servers | Plausible/Your servers |
| **Third-Party Sharing** | Never | Yes (Google ads) | Yes (integrations) | Never |
| **Open Source** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Self-Hostable** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **GDPR Compliant** | Your responsibility | Complex | Complex | By design |
| **Cookie-Free Option** | ✅ Yes (UUID-based) | ❌ No | ❌ No | ✅ Yes |
| **Full Data Ownership** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **PII Collection** | Opt-in only | Automatic | Automatic | Never |
| **IP Anonymization** | Not stored by default | Optional | Optional | Automatic |
| **Data Retention Control** | Complete | Limited | Limited | Complete |

## Privacy Limitations

### What This Library Does NOT Provide

❌ **Built-in Consent Management**: You must implement your own consent banners
❌ **Automatic Data Deletion**: You must build deletion mechanisms
❌ **IP Anonymization**: You must implement if needed
❌ **Cookie Consent**: You must handle cookie policies
❌ **GDPR Compliance Guarantees**: You are responsible for compliance
❌ **Legal Advice**: Consult qualified legal counsel

### What You Must Implement

If you collect PII (name, email, etc.), you MUST:

1. ✅ Obtain explicit user consent before tracking
2. ✅ Provide clear privacy notices
3. ✅ Implement data access APIs
4. ✅ Implement data deletion APIs
5. ✅ Implement data export/portability
6. ✅ Maintain data retention policies
7. ✅ Honor user rights (GDPR Article 12-23)

See [GDPR.md](./GDPR.md) for implementation examples.

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│  React Native) │
└──────┬──────┘
       │ Events batched (5s)
       │ Stored in localStorage
       │
       ▼
┌─────────────┐
│ Your API    │
│ Server      │
│ (Next.js/   │
│  Express)   │
└──────┬──────┘
       │ Validates API key
       │ Extracts device info
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│ Database    │
│ (Your       │
│  Server)    │
└─────────────┘

No external services
No third-party sharing
No data leaves your infrastructure
```

## Questions & Support

- **Technical Questions**: [GitHub Issues](https://github.com/jvidalv/react-analytics/issues)
- **Privacy Concerns**: [PRIVACY_CONTACT.md](./PRIVACY_CONTACT.md)
- **GDPR Implementation**: [GDPR.md](./GDPR.md)
- **Legal Compliance**: Consult qualified legal counsel

---

**Last Updated:** January 2025
**Version:** 1.0.0
