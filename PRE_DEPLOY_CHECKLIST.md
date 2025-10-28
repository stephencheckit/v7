# ✅ Pre-Deploy Checklist

Quick checklist to run before every deployment.

---

## 🚀 Quick Deploy (30 seconds)

```bash
npm run deploy
```

✅ This automatically:
1. Runs all 58 tests
2. Pushes to GitHub if tests pass
3. GitHub Actions runs tests again
4. Vercel deploys if all pass

**Done!** That's it. 🎉

---

## 📋 Manual Checklist (If Needed)

### 1. Local Testing (1 min)
```bash
# Run all tests
npm test

# Expected output:
# ✓ Test Files  6 passed (6)
# ✓ Tests  58 passed (58)
# ✓ Duration  ~300ms
```

### 2. Local Preview (30 sec)
```bash
# Start dev server
npm run dev

# Check in browser:
# http://localhost:3000
```

### 3. Check for Issues (30 sec)
- [ ] No console errors
- [ ] Forms work
- [ ] Navigation works
- [ ] No TypeScript errors

### 4. Review Changes (30 sec)
```bash
git status
git diff
```

### 5. Commit & Deploy (30 sec)
```bash
git add .
git commit -m "Description of changes"
npm run deploy
```

---

## 🎯 What Gets Tested Automatically

### Critical Functionality (58 tests)
- ✅ Form validation
- ✅ Workspace management
- ✅ Cadence scheduling
- ✅ AI summary generation
- ✅ Data conversions
- ✅ Utility functions

### Build Verification
- ✅ TypeScript compilation
- ✅ Next.js build
- ✅ No import errors

### CI/CD Pipeline
- ✅ GitHub Actions
- ✅ Vercel integration
- ✅ Production safety gates

---

## 🚨 If Tests Fail

### Locally
```bash
$ npm test
❌ FAIL lib/__tests__/utils.test.ts

1. Fix the issue
2. Run tests again
3. Deploy when green
```

### On GitHub
1. Check Actions tab
2. Review error logs
3. Fix locally
4. Push again

---

## ⚡ Quick Commands

```bash
# Test + Deploy (safest)
npm run deploy

# Just tests
npm test

# Watch mode (dev)
npm run test:watch

# Visual UI (debug)
npm run test:ui

# Standard git push (tests run on GitHub)
git push origin main
```

---

## 🎉 Success Indicators

You're ready to deploy when:
- ✅ `npm test` shows 58/58 passing
- ✅ No console errors locally
- ✅ Changes reviewed
- ✅ Committed with clear message

---

**Remember**: Tests take 300ms. Debugging production bugs takes hours. Always test first! ⚡

