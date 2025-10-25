# Sentry Setup Guide

Sentry has been installed and configured for error tracking and monitoring.

## 🚀 Quick Start

### 1. Create a Sentry Account
1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up for a free account (5,000 errors/month)
3. Create a new project and select **Next.js**

### 2. Get Your Sentry DSN
After creating your project, you'll get a **DSN** (Data Source Name) that looks like:
```
https://abc123@o123456.ingest.sentry.io/7654321
```

### 3. Add Environment Variables

Create a `.env.local` file in the project root with:

```bash
# Required - Public DSN for client-side error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional - For source map uploads (improves stack traces)
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug
SENTRY_AUTH_TOKEN=your_auth_token
```

### 4. Test It Works

Run the development server:
```bash
npm run dev
```

Then test error tracking by adding this to any page:
```typescript
<button onClick={() => { throw new Error("Test Sentry!"); }}>
  Test Error
</button>
```

Click the button and check your Sentry dashboard for the error.

---

## 📁 Files Added

- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration  
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `instrumentation.ts` - Next.js instrumentation for auto-init
- `components/error-boundary.tsx` - React error boundary component
- `next.config.ts` - Updated with Sentry webpack plugin

---

## 🛡️ Using Error Boundaries

Wrap critical parts of your app with the ErrorBoundary component:

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

export default function MyPage() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

This will:
- ✅ Catch React errors automatically
- ✅ Send errors to Sentry with component stack
- ✅ Show a friendly error UI to users
- ✅ Allow users to refresh or go to dashboard

---

## 🎯 What Sentry Captures

### Automatically Tracked:
- ❌ JavaScript/TypeScript errors (client & server)
- 🐛 Unhandled promise rejections
- 🔥 React component errors (with ErrorBoundary)
- 📊 Performance data (optional)
- 🎬 Session replays (optional - on errors only)

### With Context:
- 👤 User info (workspace ID, email)
- 🌐 Browser/device info
- 📍 URL and route info
- 🍞 Breadcrumbs (user actions leading to error)

---

## 🔧 Advanced Configuration

### Add User Context

In your auth context or layout, add:

```typescript
import * as Sentry from "@sentry/nextjs";

// When user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.email?.split('@')[0],
  workspace_id: workspaceId,
});

// When user logs out
Sentry.setUser(null);
```

### Manual Error Capture

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // risky code
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: "forms" },
    extra: { formId: "abc123" }
  });
}
```

### Capture Custom Messages

```typescript
Sentry.captureMessage("Something interesting happened", "info");
```

---

## 💰 Free Tier Limits

- **5,000 errors/month** - resets monthly
- **1 user** included
- **90 days** data retention
- Unlimited projects
- Performance monitoring (limited transactions)

Perfect for early-stage products!

---

## 🎛️ Configuration Options

Edit `sentry.client.config.ts` to adjust:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Sample rate for performance monitoring
  tracesSampleRate: 1.0, // 100% in dev, lower in prod (e.g., 0.1)
  
  // Enable debug mode for troubleshooting
  debug: false,
  
  // Environment (auto-detected but can override)
  environment: process.env.NODE_ENV,
  
  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Session replay settings
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs
});
```

---

## 📊 Viewing Errors

1. Go to [sentry.io](https://sentry.io)
2. Navigate to your project
3. View **Issues** to see all errors
4. Click on an issue to see:
   - Stack trace with source maps
   - User who experienced it
   - Breadcrumbs (user actions before error)
   - Device/browser info
   - Session replay (if enabled)

---

## 🔔 Alerts

Set up alerts in Sentry:
1. Go to **Alerts** in your Sentry project
2. Create alert rules (e.g., "Notify when new error occurs")
3. Connect to Slack, email, or other services

---

## 🚫 Disable in Development (Optional)

If you want to disable Sentry in development, update the config:

```typescript
Sentry.init({
  dsn: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SENTRY_DSN 
    : undefined,
  // ... rest of config
});
```

---

## 📖 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry Dashboard](https://sentry.io)

---

## ✅ Checklist

- [ ] Create Sentry account
- [ ] Create Next.js project in Sentry
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
- [ ] Test error tracking works
- [ ] Wrap app layout with ErrorBoundary
- [ ] Add user context in auth flow
- [ ] Set up Slack/email alerts
- [ ] Configure for production deployment

**Note:** Sentry is optional. The app works fine without it, but you won't get error tracking.

