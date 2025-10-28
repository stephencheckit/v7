# Testing Guide

## Quick Start

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with UI (visual test runner)
npm run test:ui
```

## 🎯 Current Status

✅ **58 tests** passing in ~300ms
✅ **6 test files** covering critical functionality
✅ **Automated CI/CD** protecting deployments

## What's Tested

### Core Validation (7 tests)
- Email format validation
- Phone number validation
- Required field checking

### Workspace Management (7 tests)
- Slug generation
- Domain extraction
- Consumer vs business detection

### Cadence Generation (16 tests)
- Date calculations
- Schedule pattern parsing
- Instance naming
- Status transitions
- Completion windows

### AI Summaries (12 tests)
- Data aggregation
- Metric calculations
- Date range filtering
- Insight categorization

### Data Converters (13 tests)
- Date formatting
- JSON conversion
- Form data transformation
- File size calculations

### Utilities (3 tests)
- Tailwind className merging

## Adding New Tests

### 1. Create a test file next to your code

```
lib/
  your-module.ts          ← Your code
  __tests__/
    your-module.test.ts   ← Your tests
```

### 2. Write a test

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### 3. Run tests

```bash
npm test
```

## Test Structure

- **`lib/__tests__/`** - Core library tests
- **`lib/types/__tests__/`** - Type validation tests
- **`app/api/__tests__/`** - API route tests (add later)
- **`components/__tests__/`** - Component tests (add later)

## Coverage Goals

- **Current**: 17 tests (foundation)
- **Short-term**: Add API route tests
- **Medium-term**: Add component tests
- **Long-term**: >80% critical path coverage

## Tips

1. **Test critical logic first**: Form validation, data transforms, business logic
2. **Mock external services**: Supabase, OpenAI, etc.
3. **Keep tests fast**: Aim for <1s total runtime
4. **Test behavior, not implementation**: Test what it does, not how

## Next Steps

High-value tests to add:

1. **API Routes** (Priority: HIGH)
   - Form CRUD operations
   - Submission handling
   - Authentication checks

2. **Cadence Logic** (Priority: HIGH)
   - Instance generation
   - Status updates
   - RRule calculations

3. **File Uploads** (Priority: MEDIUM)
   - Size validation
   - Type validation
   - Storage integration

4. **Components** (Priority: MEDIUM)
   - Form builder interactions
   - Chat interface
   - Calendar rendering

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Testing Score**: 25/100 → Target: 85/100
**Time Investment**: ~1 hour setup, 20% ongoing maintenance
**ROI**: Catch bugs early, deploy with confidence

