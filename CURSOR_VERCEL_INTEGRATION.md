# Cursor + Vercel Integration Guide

This guide shows you how to see Vercel deployment errors and Next.js dev errors directly in Cursor's Problems panel.

---

## 🚀 Quick Start

### 1. **TypeScript Errors in Dev Mode**

When running `npm run dev`, TypeScript errors will now show in Cursor's **Problems panel** (Cmd+Shift+M).

**To enable:**
- Press `Cmd+Shift+P` → Type "Tasks: Run Task"
- Select `🚀 Dev Server with TypeScript Problem Matcher`

**What you get:**
- ✅ Clickable file paths in Problems panel
- ✅ Navigate to errors with one click
- ✅ Real-time error updates as you code
- ✅ Background task that runs while you work

---

### 2. **Vercel Deployment Status**

Check your latest Vercel deployment directly in Cursor.

**To enable:**
- Press `Cmd+Shift+P` → Type "Tasks: Run Task"
- Select `🔍 Check Latest Vercel Deployment`

**What you get:**
- ✅ Latest deployment status (READY, ERROR, BUILDING)
- ✅ Build errors formatted for Problems panel
- ✅ Direct links to Vercel dashboard

---

## 🔧 Setup Instructions

### Option A: Vercel CLI (Easy)

1. **Install & Login:**
   ```bash
   npx vercel login
   ```

2. **Run the check script:**
   ```bash
   node scripts/check-vercel-deploy.js
   ```

### Option B: Vercel API Token (Advanced)

For automated checks and better integration:

1. **Get your Vercel token:**
   - Go to: https://vercel.com/account/tokens
   - Create new token
   - Copy it

2. **Add to environment:**
   ```bash
   echo "VERCEL_TOKEN=your_token_here" >> .env.local
   ```

3. **Update the script:**
   Edit `scripts/check-vercel-deploy.js` and set your project name:
   ```javascript
   const PROJECT_NAME = 'v7'; // Your Vercel project name
   ```

---

## 🎯 Available Tasks

Press `Cmd+Shift+P` → "Tasks: Run Task" and choose from:

| Task | What It Does |
|------|-------------|
| 🚀 Dev Server with TypeScript Problem Matcher | Runs dev server and shows errors in Problems panel |
| 🔍 Check Latest Vercel Deployment | Shows latest deploy status and errors |
| 📋 Show Latest Vercel Build Logs | Tails Vercel logs in real-time |
| 📊 Check Vercel Deployment Status | Lists recent deployments |
| 🧪 Start Test Watch Mode | Runs tests in watch mode |
| ✅ Run All Tests | Runs full test suite |

---

## 🔌 Terminal Profiles

Quick access terminal profiles (bottom-right "+" dropdown):

- **Dev Server** - Starts Next.js with Turbopack
- **Check Vercel** - Checks deployment status
- **Test Watcher** - Runs tests in watch mode
- **Regular Terminal** - Standard terminal

---

## 🐛 Troubleshooting

### TypeScript errors not showing in Problems panel?

1. Restart the Dev Server task
2. Make sure TypeScript is installed: `npm install -D typescript`
3. Check that `typescript.tsdk` is set in `.vscode/settings.json`

### Vercel CLI not working?

```bash
# Re-login
npx vercel login

# Check if you're logged in
npx vercel whoami

# List deployments manually
npx vercel ls
```

### Can't find tasks?

Press `Cmd+Shift+P` and type "Tasks: Run Task" - make sure you see the list of tasks.

---

## 📝 How It Works

### TypeScript Problem Matcher

The dev server task uses a **problem matcher** that:
- Watches the dev server output
- Extracts file paths and line numbers
- Creates clickable errors in Problems panel

Pattern it matches:
```
app/api/workflows/[id]/route.ts:74:13
Type error: Property 'user_id' does not exist...
```

### Vercel Integration

The check script:
- Uses Vercel API or CLI
- Fetches latest deployment status
- Parses build logs for errors
- Formats them for Cursor's Problems panel

---

## 🎨 Customization

### Add keyboard shortcuts

Create `.vscode/keybindings.json`:
```json
[
  {
    "key": "cmd+shift+d",
    "command": "workbench.action.tasks.runTask",
    "args": "🔍 Check Latest Vercel Deployment"
  },
  {
    "key": "cmd+shift+v",
    "command": "workbench.action.tasks.runTask",
    "args": "🚀 Dev Server with TypeScript Problem Matcher"
  }
]
```

### Webhook Integration (Advanced)

For automatic notifications when Vercel deploys fail:

1. Set up a Vercel webhook at: https://vercel.com/[team]/[project]/settings/git
2. Point it to a local endpoint or serverless function
3. Send notifications to VS Code Live Share or Slack

---

## 💡 Tips

1. **Keep Dev Server running as a background task** - errors will show automatically
2. **Check Vercel status after pushing** - catch build errors early
3. **Use keyboard shortcuts** - faster than clicking through menus
4. **Watch the Problems panel** - errors appear there automatically

---

## 📚 Resources

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Problem Matchers Guide](https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher)

