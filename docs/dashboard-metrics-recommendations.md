# Dashboard Metrics Recommendations

**Date:** 2025-11-15
**Status:** Planning Phase
**Purpose:** Comprehensive metrics recommendations for analytics dashboard

---

## Current Requested Metrics

- **MAU** - Monthly Active Users
- **DAU** - Daily Active Users
- **Total Users** - All-time unique users

---

## Recommended Metrics by Category

### 🎯 Hero KPIs (Top Priority)

**Always visible at top of dashboard**

1. **Total Users** ⭐ _requested_
   - All-time unique users (by `identify_id`)
   - Query complexity: Simple ✓
   - Endpoint: Exists (`/api/analytics/users/stats`)

2. **MAU - Monthly Active Users** ⭐ _requested_
   - Users with events in last 30 days
   - Query: `COUNT(DISTINCT identify_id) WHERE date >= NOW() - INTERVAL '30 days'`
   - Query complexity: Simple ✓
   - Endpoint: **MISSING** - needs implementation
   - Show period-over-period change (vs previous 30 days)

3. **DAU - Daily Active Users** ⭐ _requested_
   - Users with events in last 24 hours
   - Query: `COUNT(DISTINCT identify_id) WHERE date >= NOW() - INTERVAL '1 day'`
   - Query complexity: Simple ✓
   - Show period-over-period change (vs yesterday)

4. **Stickiness (DAU/MAU Ratio)**
   - Engagement quality metric
   - Formula: `(DAU / MAU) * 100`
   - Benchmarks: >20% is good, >40% is excellent
   - Query complexity: Calculated from DAU/MAU
   - Shows how often monthly users engage daily

5. **Error Rate**
   - Percentage of events that are errors
   - Formula: `(Error events / All events) * 100`
   - Query complexity: Simple ✓
   - Critical health indicator

---

### 📈 User Engagement Metrics

6. **WAU - Weekly Active Users**
   - Users with events in last 7 days
   - Query: `COUNT(DISTINCT identify_id) WHERE date >= NOW() - INTERVAL '7 days'`
   - Query complexity: Simple ✓
   - Bridges gap between DAU and MAU

7. **New Users (7d/30d)**
   - Users with first event in time period
   - Query: `COUNT(DISTINCT identify_id) WHERE first_event_date >= ...`
   - Query complexity: Simple ✓
   - Shows user acquisition trends
   - Display both 7-day and 30-day values

8. **Events per User (Average)**
   - Average activity intensity
   - Query: `AVG(event_count)` from CTE grouping by identify_id
   - Query complexity: Simple ✓
   - Indicates engagement depth

9. **Churn Rate**
   - Users who haven't been active in 30 days
   - Formula: `Users with last_event > 30 days ago / Total users * 100`
   - Query complexity: Simple ✓
   - Important retention metric

10. **Average Session Duration**
    - Time between first and last event in session
    - Uses state events + 5-min inactivity threshold
    - Query complexity: Medium (requires session grouping)
    - Shows engagement depth

11. **Sessions per User**
    - Average number of sessions per user
    - Formula: `Total sessions / Unique users`
    - Query complexity: Medium (requires session grouping)
    - Frequency of visits metric

---

### 📱 Content & Behavior Metrics

12. **Top Pages/Screens (Top 10)**
    - Most viewed navigation paths
    - Endpoint: **EXISTS** (`/api/analytics/users/stats/aggregate?type=navigation`)
    - Query complexity: Simple ✓
    - Shows what content users care about
    - Display as horizontal bar chart

13. **Top Actions (Top 10)**
    - Most triggered action events
    - Endpoint: **EXISTS** (`/api/analytics/users/stats/aggregate?type=action`)
    - Query complexity: Simple ✓
    - Shows feature usage patterns
    - Display as horizontal bar chart

14. **Average Page Views per Session**
    - Navigation events / total sessions
    - Query complexity: Medium (requires session grouping)
    - Content consumption metric

15. **Bounce Rate**
    - Sessions with only 1 navigation event
    - Formula: `Single-page sessions / total sessions * 100`
    - Query complexity: Medium (requires session analysis)
    - Quality of traffic indicator

---

### 🔧 Technical Health Metrics

16. **Top Errors (Top 10)**
    - Most common error messages
    - Endpoint: **EXISTS** (`/api/analytics/users/stats/aggregate?type=error`)
    - Query complexity: Simple ✓
    - Display as horizontal bar chart
    - Critical for identifying issues

17. **Error Trend (7 days)**
    - Daily error count chart
    - Endpoint: **EXISTS** (`/api/analytics/users/all/errors`)
    - Query complexity: Simple ✓
    - Display as line/area chart
    - Shows if errors are increasing/decreasing

18. **Users Affected by Errors**
    - Unique users who encountered any error
    - Query: `COUNT(DISTINCT identify_id) WHERE type = 'error'`
    - Query complexity: Simple ✓
    - Error impact metric

19. **Error-Free Users %**
    - Percentage of users with zero errors
    - Formula: `(Total users - Users with errors) / Total users * 100`
    - Query complexity: Simple ✓
    - Stability/quality metric

---

### 🌍 Platform Insights

20. **Platform Distribution**
    - iOS vs Android vs Web breakdown
    - Data: **EXISTS** in `/api/analytics/users/stats` (ios_count, android_count)
    - Query: `GROUP BY info->>'platform'`
    - Query complexity: Simple ✓
    - Display as pie/donut chart

21. **Top Countries (Top 10)**
    - Geographic distribution of users
    - Endpoint: **EXISTS** (`/api/analytics/users/stats/aggregate?type=country`)
    - Query complexity: Simple ✓
    - Display as horizontal bar chart or map
    - Uses country code from request headers

22. **App Version Distribution**
    - Active users by app version
    - Query: `GROUP BY app_version`
    - Query complexity: Simple ✓
    - Shows adoption of latest version
    - Helps identify upgrade lag

23. **OS Version Distribution**
    - Users by operating system version
    - Query: `GROUP BY info->>'osVersion'`
    - Query complexity: Simple ✓
    - Helps with compatibility planning

24. **Device Brand Distribution (Mobile)**
    - Top device manufacturers
    - Query: `GROUP BY info->>'brand' WHERE platform IN ('ios', 'android')`
    - Query complexity: Simple ✓
    - Android fragmentation insights

---

### 📊 Time Trends & Patterns

25. **DAU Trend (30 days)**
    - Time-series line chart of daily active users
    - Query: `COUNT(DISTINCT identify_id) GROUP BY date_trunc('day', date)`
    - Query complexity: Medium (time-series aggregation)
    - Visualizes growth trajectory
    - Most important trend chart

26. **Event Volume Trend (30 days)**
    - Total events per day
    - Query: `COUNT(*) GROUP BY date_trunc('day', date)`
    - Query complexity: Simple ✓
    - Shows overall activity patterns

27. **Hourly Usage Pattern (24h heatmap)**
    - Peak usage hours
    - Query: `COUNT(*) GROUP BY EXTRACT(HOUR FROM date)`
    - Query complexity: Simple ✓
    - Display as bar chart or heatmap
    - Identifies peak traffic times

28. **Day of Week Pattern**
    - Usage distribution by weekday
    - Query: `COUNT(*) GROUP BY EXTRACT(DOW FROM date)`
    - Query complexity: Simple ✓
    - Identifies weekly patterns (weekday vs weekend)

29. **User Growth Rate**
    - Month-over-month or week-over-week new user growth
    - Formula: `(New users this period - New users last period) / New users last period * 100`
    - Query complexity: Medium (time-based comparison)
    - Shows growth momentum

---

### 🎯 Conversion & Business Metrics

30. **Identification Rate**
    - Percentage of users who identify themselves
    - Formula: `(Identified users / Total users) * 100`
    - Data: **EXISTS** in `/api/analytics/users/stats` (identifiedCount, anonymousCount)
    - Query complexity: Simple ✓
    - Conversion metric for user registration/login

31. **Time to Identification**
    - Average time between first event and identify event
    - Query complexity: Medium (requires timestamp math)
    - Conversion funnel metric

32. **Returning Users Rate**
    - Percentage of users who came back after first visit
    - Formula: `Users with events on 2+ different days / Total users * 100`
    - Query complexity: Medium (requires date grouping)
    - Retention indicator

---

### 🔬 Advanced Analytics (Phase 2+)

33. **User Retention (D1, D7, D30)**
    - Percentage of users returning 1, 7, or 30 days after first visit
    - Requires cohort analysis
    - Query complexity: High (cohort analysis + joins)
    - Gold standard retention metric

34. **Session Duration Distribution**
    - Histogram of session lengths
    - Shows engagement patterns
    - Query complexity: Medium

35. **User Journey Flows (Top 5)**
    - Sequential page paths (e.g., Home → Product → Checkout)
    - Query complexity: High (requires sequence analysis)
    - Funnel optimization insights

---

## Recommended Implementation Priority

### **Phase 1: Core KPIs** (Week 1)

_Highest value, simplest implementation_

- ✅ Total Users (exists)
- 🔨 MAU (needs implementation)
- 🔨 DAU
- 🔨 WAU
- 🔨 DAU/MAU Ratio (calculated)
- 🔨 Error Rate
- ✅ Platform Distribution (exists, needs display)

**Expected outcome:** Dashboard with 7 core metrics showing health and engagement

---

### **Phase 2: Engagement & Content** (Week 2)

_High value, moderate complexity_

- 🔨 New Users (7d/30d)
- 🔨 Events per User
- 🔨 Churn Rate
- ✅ Top Pages (exists, needs display)
- ✅ Top Actions (exists, needs display)
- ✅ Identification Rate (exists, needs display)
- 🔨 DAU Trend (30d chart)

**Expected outcome:** Full engagement picture with behavior insights

---

### **Phase 3: Trends & Deep Dives** (Week 3)

_Medium value, varied complexity_

- 🔨 Event Volume Trend
- ✅ Error Trend (exists, needs display)
- 🔨 User Growth Rate
- ✅ Top Countries (exists, needs display)
- ✅ Top Errors (exists, needs display)
- 🔨 Hourly Usage Pattern
- 🔨 App Version Distribution

**Expected outcome:** Time-based insights and technical health monitoring

---

### **Phase 4: Advanced Analytics** (Week 4+)

_Lower priority, higher complexity_

- 🔨 Session metrics (duration, count)
- 🔨 Retention cohorts
- 🔨 User journey flows
- 🔨 Device/OS analytics
- 🔨 Conversion funnels

**Expected outcome:** Advanced analytics capabilities

---

## Top 10 "Must-Have" Metrics

If starting with limited scope, these 10 provide maximum insight:

1. **Total Users** ⭐
2. **MAU** ⭐
3. **DAU** ⭐
4. **Stickiness (DAU/MAU)**
5. **New Users (7d/30d)**
6. **Top Pages/Screens**
7. **Error Rate**
8. **DAU Trend (30d chart)**
9. **Platform Distribution**
10. **Average Session Duration**

---

## Dashboard Layout Recommendation

### **Hero Metrics Row**

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Users  │     MAU      │     DAU      │  Stickiness  │  Error Rate  │
│   125,432    │   12,543     │    3,821     │    30.5%     │     2.1%     │
│   +12.3%     │   +8.2%      │   +5.1%      │   +2.1pp     │   -0.3pp     │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### **Main Dashboard Grid**

```
┌───────────────────────────────────┬───────────────────────────────────┐
│  DAU Trend (30 days)              │  Platform Distribution            │
│  [Line Chart]                     │  [Pie/Donut Chart]                │
│                                   │  iOS: 45% | Android: 40% | Web: 15%│
├───────────────────────────────────┼───────────────────────────────────┤
│  Top Pages                        │  Top Actions                      │
│  [Horizontal Bar Chart]           │  [Horizontal Bar Chart]           │
│  1. /home - 12.5K                 │  1. button_click - 8.2K           │
│  2. /product - 8.3K               │  2. search - 6.1K                 │
│  ...                              │  ...                              │
├───────────────────────────────────┴───────────────────────────────────┤
│  Error Trend (7 days)                                                 │
│  [Stacked Area Chart by error type]                                  │
├───────────────────────────────────────────────────────────────────────┤
│  Engagement Metrics                                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐           │
│  │  New Users  │  Sessions   │ Events/User │ Churn Rate  │           │
│  │    842      │    15.2K    │    23.4     │    18.2%    │           │
│  └─────────────┴─────────────┴─────────────┴─────────────┘           │
└───────────────────────────────────────────────────────────────────────┘
```

### **Sections/Tabs**

- **Overview** - Hero metrics + key charts
- **Engagement** - User behavior and retention metrics
- **Technical** - Errors, performance, platform stats
- **Trends** - Time-series charts and patterns

---

## Performance Considerations

### **Cache Strategy**

**Real-time (no cache):**

- None recommended - all queries benefit from brief caching

**5-minute cache:**

- Hero KPIs (MAU, DAU, Total Users)
- Error Rate
- Platform Distribution

**15-minute cache:**

- Top Pages/Actions/Errors
- New Users counts
- Events per User

**1-hour cache:**

- Time-series charts (30-day trends)
- Session metrics
- Retention calculations

**Daily pre-aggregation:**

- Long-term trends (90+ days)
- Historical comparisons
- Cohort analysis

### **Query Optimization**

**Existing indexes (good for):**

- `(apiKey, identifyId, date DESC)` - User-centric queries
- `(identifyId, type, date DESC)` - Event-type filtering

**Recommended additional indexes:**

- `(apiKey, date DESC)` - Time-range queries without user filter
- `(apiKey, type, date DESC)` - Event-type aggregations
- `(apiKey, (info->>'platform'), date DESC)` - Platform filtering (JSONB index)

**Query patterns:**

- Always include `apiKey` in WHERE (uses index)
- Use `date` range filters (last 7d, 30d, etc.)
- Prefer `COUNT(DISTINCT identify_id)` for user counts
- Use `date_trunc()` for time-series grouping
- Leverage existing `DISTINCT ON` pattern for user deduplication

---

## Technical Implementation Notes

### **API Endpoints to Create**

1. **`GET /api/protected/app/[slug]/analytics/stats/overview`**
   - Returns all hero KPIs in single request
   - Reduces round-trips

2. **`GET /api/protected/app/[slug]/analytics/stats/mau`** ⚠️ **MISSING**
   - Monthly Active Users with period comparison
   - High priority (referenced but doesn't exist)

3. **`GET /api/protected/app/[slug]/analytics/stats/dau-trend`**
   - 30-day DAU time series
   - Format: `[{date: "2025-01-15", dau: 3821}, ...]`

4. **`GET /api/protected/app/[slug]/analytics/stats/engagement`**
   - Session metrics, events/user, new users
   - Grouped related metrics

### **Frontend Chart Libraries**

Recommended: **Recharts** (React-friendly, lightweight)

- Line charts: DAU trend, event volume
- Bar charts: Top pages, actions, errors
- Pie/donut: Platform distribution
- Area charts: Error trends

Alternative: **Apache ECharts** (powerful, good for heatmaps)

### **Data Freshness Indicators**

Show "Last updated: X minutes ago" on cached data

---

## Success Metrics for Dashboard

**Adoption:**

- Daily active dashboard users
- Time spent on dashboard
- Most viewed metrics

**Impact:**

- Decisions made based on metrics
- Issues identified and resolved
- Feature usage correlated with analytics

**Performance:**

- Dashboard load time < 2 seconds
- Query response time < 500ms (cached)
- No query > 3 seconds (even uncached)

---

## Related Documentation

- [Analytics Modernization Plan](./analytics-modernization-plan.md) - Full analytics system review
- Database schema: `src/db/schema.ts`
- Existing endpoints: `src/api/routes/protected/app/[slug]/analytics/`
- Push endpoint: `src/api/routes/public/analytics/post-push.route.ts`

---

## Next Steps

1. ✅ Store this document
2. 🔨 Implement Phase 1 metrics (MAU, DAU, WAU, core KPIs)
3. 🔨 Create dashboard UI layout
4. 🔨 Implement charts and visualizations
5. 🔨 Add caching layer
6. 🔨 Performance testing and optimization
7. 🔨 Progressive rollout of Phase 2-4 metrics

---

**Legend:**

- ⭐ User requested
- ✅ Already implemented (backend)
- 🔨 Needs implementation
- ⚠️ Referenced but missing
