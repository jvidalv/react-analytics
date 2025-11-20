# GDPR Compliance Implementation Guide

This guide helps you implement GDPR compliance when using React Analytics. **This is guidance, not legal advice. Consult qualified legal counsel.**

## Table of Contents

1. [GDPR Overview](#gdpr-overview)
2. [Your Role & Responsibilities](#your-role--responsibilities)
3. [Compliance Checklist](#compliance-checklist)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Privacy Policy Template](#privacy-policy-template)

---

## GDPR Overview

### What is GDPR?

The General Data Protection Regulation (GDPR) is EU law that protects personal data of EU residents. It applies if you:
- Have users in the EU
- Process data of EU residents
- Monitor behavior of individuals in the EU

**Key Principles:**
- **Lawfulness**: Have legal basis for processing
- **Transparency**: Be clear about data collection
- **Purpose Limitation**: Only collect for specified purposes
- **Data Minimization**: Collect only what's necessary
- **Accuracy**: Keep data accurate and up-to-date
- **Storage Limitation**: Don't keep data longer than needed
- **Integrity & Confidentiality**: Keep data secure
- **Accountability**: Demonstrate compliance

### When Does GDPR Apply to Analytics?

✅ **GDPR Applies** if you collect:
- Email addresses
- Names
- User IDs linked to individuals
- IP addresses (in some cases)
- Device identifiers linked to individuals

❌ **GDPR May Not Apply** for:
- Truly anonymous data
- Aggregated statistics
- Non-identifiable device UUIDs (if not linked to users)

**⚠️ Important**: Once you call `analytics.identify()` with email or name, you're processing personal data under GDPR.

---

## Your Role & Responsibilities

### You Are the Data Controller

When you use React Analytics, **YOU** are the:
- **Data Controller**: You determine purposes and means of processing
- **Responsible Party**: You ensure GDPR compliance
- **Decision Maker**: You decide what data to collect and how

React Analytics is a **tool**. Tools don't make you compliant—your implementation does.

### Your Obligations

As data controller, you must:

1. ✅ Have a lawful basis for processing
2. ✅ Obtain user consent when required
3. ✅ Provide clear privacy notices
4. ✅ Honor user rights (access, deletion, portability, etc.)
5. ✅ Implement appropriate security
6. ✅ Maintain processing records
7. ✅ Report data breaches (within 72 hours)
8. ✅ Conduct DPIAs for high-risk processing
9. ✅ Appoint a DPO (if required)
10. ✅ Comply with children's data rules (under 16)

---

## Compliance Checklist

### Step 1: Legal Basis Assessment

Determine your legal basis for processing:

| Basis | When Applicable | Example |
|-------|----------------|---------|
| **Consent** | User explicitly agrees | "I agree to analytics tracking" |
| **Contract** | Necessary for service | Analytics for app functionality |
| **Legitimate Interest** | Balancing test passes | Security monitoring, fraud prevention |
| **Legal Obligation** | Required by law | Tax records, legal compliance |

**For most analytics with PII**: You need **consent** or **legitimate interest** (with balancing test).

### Step 2: Consent Management

If using consent as legal basis:

- [ ] Implement consent banner/modal
- [ ] Obtain consent BEFORE tracking
- [ ] Make consent opt-in (not pre-checked)
- [ ] Provide granular choices
- [ ] Make consent easy to withdraw
- [ ] Record consent timestamp
- [ ] Document consent mechanism

### Step 3: Privacy Notice

- [ ] Create clear, accessible privacy policy
- [ ] Explain what data is collected
- [ ] State why data is collected (purpose)
- [ ] Specify who can access data
- [ ] State data retention period
- [ ] List user rights
- [ ] Provide contact information
- [ ] Update when practices change

### Step 4: User Rights Implementation

Implement mechanisms for users to:

- [ ] **Access**: View their data
- [ ] **Delete**: Remove their data (right to be forgotten)
- [ ] **Portability**: Export their data
- [ ] **Rectify**: Correct inaccurate data
- [ ] **Restrict**: Limit processing
- [ ] **Object**: Stop processing
- [ ] **Withdraw Consent**: Stop tracking

### Step 5: Security Measures

- [ ] Use HTTPS for all analytics requests
- [ ] Enable database encryption at rest
- [ ] Implement API key authentication
- [ ] Use strong passwords for database
- [ ] Regular security updates
- [ ] Access controls (who can view data)
- [ ] Audit logs
- [ ] Backup procedures

### Step 6: Data Retention

- [ ] Define retention period (recommended: 13-26 months)
- [ ] Document business justification
- [ ] Implement automatic deletion
- [ ] Delete on user request
- [ ] Separate retention for different data types

### Step 7: Documentation

- [ ] Maintain Record of Processing Activities (ROPA)
- [ ] Document consent mechanisms
- [ ] Document security measures
- [ ] Document data retention policy
- [ ] Document breach response plan
- [ ] Keep evidence of compliance

### Step 8: Data Protection Impact Assessment (DPIA)

Required if processing is "likely to result in high risk". Conduct DPIA if:
- Large-scale processing of sensitive data
- Systematic monitoring
- Automated decision-making
- Processing of children's data
- Biometric/genetic data processing

---

## Implementation Guide

### 1. Consent Implementation

#### Option A: Consent Banner (Recommended)

```typescript
// components/ConsentBanner.tsx
import { useState, useEffect } from 'react';
import { analytics } from '@jvidalv/react-analytics';

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent already given
    const consent = localStorage.getItem('analytics-consent');
    const consentTimestamp = localStorage.getItem('analytics-consent-timestamp');

    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'true') {
      // Initialize analytics if consent previously given
      analytics.init({
        apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!,
        url: process.env.NEXT_PUBLIC_ANALYTICS_URL
      });
    }
  }, []);

  const handleAccept = () => {
    // Record consent
    const timestamp = new Date().toISOString();
    localStorage.setItem('analytics-consent', 'true');
    localStorage.setItem('analytics-consent-timestamp', timestamp);

    // Initialize analytics
    analytics.init({
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!,
      url: process.env.NEXT_PUBLIC_ANALYTICS_URL
    });

    setShowBanner(false);

    // Optional: Store consent record on server
    fetch('/api/consent/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        consentGiven: true,
        deviceId: analytics.getIdentifyId()
      })
    });
  };

  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use analytics to improve your experience. Your data stays on our
            servers and is never shared with third parties.{' '}
            <a href="/privacy" className="underline">Learn more</a>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Option B: Consent Modal (More Prominent)

```typescript
// components/ConsentModal.tsx
import { useState, useEffect } from 'react';
import { analytics } from '@jvidalv/react-analytics';

export function ConsentModal() {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent');
    if (!consent) {
      setShowModal(true);
    } else if (consent === 'true') {
      analytics.init({
        apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!
      });
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true');
    localStorage.setItem('analytics-consent-timestamp', new Date().toISOString());
    analytics.init({
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!
    });
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Privacy & Analytics</h2>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-700">
            We'd like to collect analytics to improve your experience.
          </p>

          {showDetails ? (
            <div className="text-sm space-y-2 p-3 bg-gray-50 rounded">
              <p><strong>What we collect:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Page navigation</li>
                <li>Button clicks</li>
                <li>Error occurrences</li>
                <li>Device type (iOS/Android/Web)</li>
                <li>App version</li>
              </ul>
              <p className="mt-2"><strong>What we DON'T collect:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Your email or name (unless you create an account)</li>
                <li>Personal messages or content</li>
                <li>Payment information</li>
              </ul>
              <p className="mt-2"><strong>Your data:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Stored securely on our servers</li>
                <li>Never shared with third parties</li>
                <li>Deleted on request</li>
              </ul>
            </div>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="text-sm text-blue-600 underline"
            >
              Show details
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem('analytics-consent', 'false');
              setShowModal(false);
            }}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
          >
            No thanks
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Accept
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
```

### 2. Implement User Rights

#### Data Access (Right to Access)

```typescript
// app/api/analytics/user-data/route.ts
import { db } from '@/db';
import { analytics, analyticsTest } from '@/db/schema';
import { eq, or, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Search in production table
    const productionData = await db
      .select()
      .from(analytics)
      .where(sql`${analytics.properties}->>'email' = ${email}`)
      .limit(1000);

    // Search in test table
    const testData = await db
      .select()
      .from(analyticsTest)
      .where(sql`${analyticsTest.properties}->>'email' = ${email}`)
      .limit(1000);

    // Combine and format
    const userData = {
      requestDate: new Date().toISOString(),
      email,
      events: {
        production: productionData.map(event => ({
          id: event.id,
          type: event.type,
          timestamp: event.date,
          properties: event.properties,
          deviceInfo: event.info
        })),
        test: testData.map(event => ({
          id: event.id,
          type: event.type,
          timestamp: event.date,
          properties: event.properties,
          deviceInfo: event.info
        }))
      },
      totalEvents: productionData.length + testData.length
    };

    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Data access error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}
```

#### Data Deletion (Right to be Forgotten)

```typescript
// app/api/analytics/delete-user-data/route.ts
import { db } from '@/db';
import { analytics, analyticsTest } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or userId required' },
        { status: 400 }
      );
    }

    // Build deletion condition
    const condition = email
      ? sql`${analytics.properties}->>'email' = ${email}`
      : sql`${analytics.userId} = ${userId}`;

    // Delete from production
    const deletedProduction = await db
      .delete(analytics)
      .where(condition);

    // Delete from test
    const deletedTest = await db
      .delete(analyticsTest)
      .where(condition);

    // Refresh materialized views
    await db.execute(
      sql`REFRESH MATERIALIZED VIEW analytics_identified_users_mv`
    );
    await db.execute(
      sql`REFRESH MATERIALIZED VIEW analytics_test_identified_users_mv`
    );

    // Log deletion for audit
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'data_deletion',
        email,
        userId,
        timestamp: new Date().toISOString()
      })
    });

    return NextResponse.json({
      success: true,
      message: 'User data deleted successfully'
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
```

#### Data Export (Right to Portability)

```typescript
// app/api/analytics/export-user-data/route.ts
import { db } from '@/db';
import { analytics, analyticsTest } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, format = 'json' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Fetch all user data
    const productionData = await db
      .select()
      .from(analytics)
      .where(sql`${analytics.properties}->>'email' = ${email}`);

    const testData = await db
      .select()
      .from(analyticsTest)
      .where(sql`${analyticsTest.properties}->>'email' = ${email}`);

    const exportData = {
      exportDate: new Date().toISOString(),
      email,
      dataController: 'Your Company Name',
      format,
      events: {
        production: productionData,
        test: testData
      },
      summary: {
        totalEvents: productionData.length + testData.length,
        firstEvent: productionData[0]?.date,
        lastEvent: productionData[productionData.length - 1]?.date
      }
    };

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(exportData.events.production);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-data-${email}-${Date.now()}.csv"`
        }
      });
    }

    // Return JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics-data-${email}-${Date.now()}.json"`
      }
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = ['id', 'type', 'date', 'properties', 'info'];
  const rows = data.map(row => [
    row.id,
    row.type,
    row.date,
    JSON.stringify(row.properties),
    JSON.stringify(row.info)
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}
```

### 3. Data Retention Implementation

#### Automated Cleanup Script

```typescript
// scripts/cleanup-old-analytics.ts
import { db } from './src/db';
import { analytics, analyticsTest } from './src/db/schema';
import { lt } from 'drizzle-orm';

async function cleanupOldAnalytics() {
  console.log('🗑️  Starting analytics data cleanup...');

  // Delete data older than 13 months (recommended retention)
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

  // Delete old production data
  const deletedProd = await db
    .delete(analytics)
    .where(lt(analytics.date, thirteenMonthsAgo));

  console.log(`✅ Deleted ${deletedProd.rowCount} old production events`);

  // Delete old test data (shorter retention - 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const deletedTest = await db
    .delete(analyticsTest)
    .where(lt(analyticsTest.date, ninetyDaysAgo));

  console.log(`✅ Deleted ${deletedTest.rowCount} old test events`);

  console.log('✨ Cleanup completed');
  process.exit(0);
}

cleanupOldAnalytics().catch(console.error);
```

#### Cron Job Setup

```bash
# Add to crontab (runs monthly on 1st at 2am)
0 2 1 * * cd /path/to/project && npx tsx scripts/cleanup-old-analytics.ts >> /var/log/analytics-cleanup.log 2>&1
```

Or use Vercel Cron:

```typescript
// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics, analyticsTest } from '@/db/schema';
import { lt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    await db.delete(analytics).where(lt(analytics.date, thirteenMonthsAgo));

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
```

### 4. Privacy Settings Page

```typescript
// app/settings/privacy/page.tsx
'use client';

import { useState } from 'react';
import { analytics } from '@jvidalv/react-analytics';

export default function PrivacySettings() {
  const [consent, setConsent] = useState(
    localStorage.getItem('analytics-consent') === 'true'
  );
  const [loading, setLoading] = useState(false);

  const handleToggleConsent = () => {
    if (consent) {
      // Withdraw consent
      localStorage.setItem('analytics-consent', 'false');
      analytics.destroy(); // Stop tracking
      setConsent(false);
    } else {
      // Give consent
      localStorage.setItem('analytics-consent', 'true');
      localStorage.setItem('analytics-consent-timestamp', new Date().toISOString());
      analytics.init({
        apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!
      });
      setConsent(true);
    }
  };

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/export-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com', // Get from session
          format: 'json'
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-analytics-data-${Date.now()}.json`;
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analytics/delete-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com' // Get from session
        })
      });

      if (response.ok) {
        alert('Your data has been deleted');
      } else {
        alert('Failed to delete data');
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      alert('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>

      {/* Analytics Consent */}
      <div className="border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Analytics Tracking</h2>
            <p className="text-sm text-gray-600">
              Allow us to collect usage data to improve your experience
            </p>
          </div>
          <button
            onClick={handleToggleConsent}
            className={`px-4 py-2 rounded ${
              consent
                ? 'bg-green-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            {consent ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Download Data */}
      <div className="border rounded-lg p-6 mb-4">
        <h2 className="font-semibold mb-2">Download Your Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export all analytics data we have collected about you
        </p>
        <button
          onClick={handleDownloadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Downloading...' : 'Download Data'}
        </button>
      </div>

      {/* Delete Data */}
      <div className="border border-red-200 rounded-lg p-6">
        <h2 className="font-semibold mb-2 text-red-600">Delete Your Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete all analytics data. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteData}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete All Data'}
        </button>
      </div>
    </div>
  );
}
```

---

## Privacy Policy Template

```markdown
# Privacy Policy

**Last Updated:** [Date]

## 1. Introduction

[Your Company] ("we", "us", "our") operates [Your App] ("the Service").

This Privacy Policy explains how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.

## 2. Data Controller

The data controller responsible for your personal data is:

[Your Company Name]
[Address]
[Email]
[Phone]

## 3. Data We Collect

### 3.1 Automatically Collected

- Device identifier (UUID)
- Page navigation paths
- Button clicks and interactions
- Error messages
- Device type and platform
- App version
- Country (derived from IP address)

### 3.2 User-Provided (Only with Consent)

- Email address
- Name
- Avatar/profile photo
- [Other data you collect]

## 4. Legal Basis for Processing

We process your data based on:

- **Your Consent**: For analytics tracking (GDPR Article 6(1)(a))
- **Contract Performance**: For providing our service (GDPR Article 6(1)(b))
- **Legitimate Interest**: For security and fraud prevention (GDPR Article 6(1)(f))

## 5. Purpose of Processing

We use your data to:

- Improve user experience
- Fix bugs and errors
- Analyze usage patterns
- Enhance app features
- Ensure security

## 6. Data Retention

- **Active Users**: 13 months from last activity
- **Inactive Users**: 26 months maximum
- **Test Data**: 90 days

## 7. Your Rights Under GDPR

You have the right to:

- **Access**: Request a copy of your data
- **Rectification**: Correct inaccurate data
- **Erasure**: Delete your data ("right to be forgotten")
- **Portability**: Receive your data in machine-readable format
- **Restriction**: Limit how we process your data
- **Object**: Object to processing
- **Withdraw Consent**: Stop analytics tracking

To exercise these rights, contact: [email]

## 8. Data Security

We implement:

- HTTPS encryption for data in transit
- Database encryption at rest
- API key authentication
- Access controls
- Regular security audits

## 9. Data Sharing

We **DO NOT**:

- Sell your data
- Share data with advertisers
- Transfer data to third parties

Your data stays on our servers and is never shared externally.

## 10. International Transfers

Our servers are located in [Country/Region]. We do not transfer data outside [EU/EEA/Your Region].

## 11. Children's Privacy

We do not knowingly collect data from children under 16 without parental consent.

## 12. Changes to This Policy

We may update this policy. We will notify you of significant changes via [email/app notification].

## 13. Contact & Complaints

For privacy questions: [email]

You have the right to lodge a complaint with your supervisory authority:
[Link to relevant data protection authority]

## 14. Data Protection Officer

[If required] Our DPO can be reached at: [email]
```

---

## Key Takeaways

✅ **You Are Responsible**: GDPR compliance is your obligation as data controller

✅ **Consent First**: Get explicit consent before collecting PII

✅ **Be Transparent**: Clear privacy notices and easy-to-understand language

✅ **Honor Rights**: Implement data access, deletion, and portability

✅ **Security Matters**: Encrypt data and implement access controls

✅ **Retention Limits**: Don't keep data forever—implement automatic deletion

✅ **Document Everything**: Maintain records of processing activities

✅ **Seek Legal Advice**: Consult qualified counsel for your specific situation

---

**This is guidance, not legal advice. Consult qualified legal professionals for compliance requirements specific to your situation.**

For technical privacy details, see [PRIVACY.md](./PRIVACY.md).

**Last Updated:** January 2025
