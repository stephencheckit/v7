# 🚀 Deployment Guide

## Pre-Deployment Checklist

### Automatic Checks ✅
When you deploy, these run automatically:
- ✅ **58 tests** must pass
- ✅ **Build** must succeed
- ✅ **Type checking** must pass

### Manual Checks (Quick Review)
- [ ] Test locally: `npm run dev`
- [ ] Run tests: `npm test`
- [ ] Check for console errors
- [ ] Review changed files: `git status`

---

## 🎯 Deployment Methods

### Method 1: Safe Deploy (Recommended)
```bash
# Run tests automatically, then deploy
npm run deploy
```

This command:
1. Runs `npm test` (58 tests)
2. If tests pass → pushes to GitHub
3. GitHub Actions runs tests again
4. Vercel auto-deploys after tests pass

**Result**: Zero chance of broken code reaching production ✅

---

### Method 2: Manual Deploy
```bash
# 1. Run tests first
npm test

# 2. If tests pass, commit and push
git add .
git commit -m "Your commit message"
git push origin main
```

**Result**: GitHub Actions will run tests before Vercel deploys

---

### Method 3: Quick Deploy (Use Sparingly)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Warning**: Tests will run on GitHub, but you won't catch failures early

---

## 🔒 Safety Gates

### Gate 1: Local (Your Machine)
```bash
npm run deploy  ← Tests run here first
```

### Gate 2: GitHub Actions
- Tests run on push/PR
- Build verification
- Multiple Node versions (optional)

### Gate 3: Vercel
- Automatic deployment after GitHub tests pass
- Preview deployments for PRs
- Production deployment for main branch

---

## 🚨 What Happens If Tests Fail?

### Local Failure
```bash
$ npm run deploy
> vitest run
❌ FAIL lib/__tests__/utils.test.ts
Test Files  1 failed

Error: Tests failed. Deployment aborted.
```

**Result**: Code never leaves your machine ✅

### GitHub Failure
```
✓ Checkout code
✓ Install dependencies
❌ Run tests (FAILED)
⏸️ Deploy (SKIPPED)
```

**Result**: Vercel won't deploy ✅

---

## 📊 Deployment Status

### Check Test Results
- **Local**: `npm test`
- **GitHub**: Check Actions tab
- **Vercel**: Check deployment logs

### View Live Tests on GitHub
1. Go to: `https://github.com/your-username/v7/actions`
2. Click latest workflow run
3. See test results + build logs

---

## 🎬 First Deployment with Tests

1. **Make a small change** (e.g., update a comment)

2. **Run tests locally**:
```bash
npm test
```

3. **Deploy**:
```bash
npm run deploy
```

4. **Watch GitHub Actions**:
   - Go to GitHub → Actions tab
   - See tests run in real-time
   - Get notified if anything fails

5. **Verify on Vercel**:
   - Check Vercel dashboard
   - See deployment status
   - Visit production URL

---

## ⚡ Quick Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm test` | Run all tests | Before committing |
| `npm run test:watch` | Auto-run tests on changes | During development |
| `npm run test:ui` | Visual test interface | Debugging tests |
| `npm run deploy` | Test + deploy | Ready to push |
| `git push` | Deploy (tests on GitHub) | Quick push |

---

## 🔧 Configuration Files

### Tests Run Here:
- `.github/workflows/test.yml` - On every push/PR
- `.github/workflows/deploy.yml` - On push to main
- `vitest.config.mjs` - Test configuration

### Deployment Settings:
- `vercel.json` - Vercel configuration
- `package.json` - Build scripts

---

## 💡 Best Practices

### ✅ DO
- Run `npm test` before every commit
- Use `npm run deploy` for peace of mind
- Write tests for new features
- Check GitHub Actions after pushing
- Review Vercel deployment logs

### ❌ DON'T
- Force push to main
- Skip tests when "in a hurry"
- Ignore test failures
- Deploy without running tests locally
- Disable CI checks

---

## 🐛 Troubleshooting

### Tests Pass Locally but Fail on GitHub
**Cause**: Environment differences
**Fix**: Check GitHub Actions logs for specific errors

### Tests Are Slow
**Cause**: Too many tests or heavy operations
**Current**: 58 tests in ~300ms ✅
**Fix**: If >1s, optimize or parallelize

### Build Fails After Tests Pass
**Cause**: TypeScript errors or missing dependencies
**Fix**: Run `npm run build` locally first

### Vercel Not Deploying
**Cause**: GitHub Actions failed
**Fix**: Check Actions tab for error logs

---

## 📈 Testing Metrics

### Current Status
- **Tests**: 58 ✅
- **Duration**: ~300ms ⚡
- **Coverage**: ~15% (foundation)
- **Files**: 6 test files

### Goals
- **Week 2**: 80+ tests
- **Week 4**: 150+ tests  
- **Month 2**: 300+ tests
- **Coverage**: 60%+

---

## 🎉 Success Indicators

You know your deployment is safe when:
- ✅ All 58 tests pass locally
- ✅ GitHub Actions shows green checkmark
- ✅ Vercel shows "Deployment Ready"
- ✅ No console errors in production
- ✅ Features work as expected

---

## 🔗 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Vitest Docs](https://vitest.dev/)

---

## 📞 Quick Help

### Failed Tests?
```bash
npm run test:ui  # Visual debugging
```

### Need to Deploy Urgently?
```bash
# Deploy anyway (not recommended)
git push origin main --no-verify
```

### Want to Test Before Committing?
```bash
npm run test:watch  # Auto-run tests
```

---

**Remember**: A few seconds running tests saves hours debugging production issues! 🚀

**Current Status**: 58 tests protecting your deployments ✅

