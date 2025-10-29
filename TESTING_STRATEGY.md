# Testing Strategy - How to Maintain Test Coverage

**Current Status:** 720 tests | 92/100 score | CI/CD automated

---

## 🎯 **Golden Rule: Test Before You Build**

**When adding ANY new feature, follow this order:**

1. **Plan the feature** (what should it do?)
2. **Write the test first** (test-driven development)
3. **Build the feature** (make the test pass)
4. **Push to GitHub** (CI runs tests automatically)

---

## 📋 **Quick Checklist: Do I Need a Test?**

**YES, write tests if you're adding:**
- ✅ New API route (`app/api/**/route.ts`)
- ✅ New database query or mutation
- ✅ New form validation logic
- ✅ New business logic (calculations, conversions, etc.)
- ✅ New utility function
- ✅ New component with complex logic

**NO test needed (optional):**
- ❌ Pure UI styling changes (CSS/Tailwind)
- ❌ Simple text/copy changes
- ❌ Documentation updates

---

## 🏗️ **Test Types & When to Use Them**

### **1. Unit Tests** (Most Common)
**When:** Testing individual functions, utilities, or logic  
**Where:** `lib/__tests__/`, `hooks/__tests__/`, `components/__tests__/`

**Example:** Testing a temperature conversion function
```typescript
// lib/__tests__/temperature-utils.test.ts
import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit } from '@/lib/temperature-utils';

describe('Temperature Conversion', () => {
  it('converts 0°C to 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });
  
  it('converts 100°C to 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });
});
```

---

### **2. API Route Tests**
**When:** Adding/modifying API endpoints  
**Where:** `app/api/**/__tests__/`

**Example:** Testing a new API endpoint
```typescript
// app/api/recipes/__tests__/recipe-api.test.ts
import { describe, it, expect } from 'vitest';

describe('Recipe API', () => {
  describe('POST /api/recipes', () => {
    it('creates a new recipe', () => {
      const recipe = {
        name: 'Chocolate Cake',
        ingredients: ['flour', 'sugar', 'cocoa'],
      };
      
      // Test validation logic
      expect(validateRecipe(recipe)).toEqual({
        valid: true,
        errors: [],
      });
    });
    
    it('rejects recipe without name', () => {
      const recipe = { ingredients: ['flour'] };
      
      expect(validateRecipe(recipe)).toEqual({
        valid: false,
        errors: ['Name is required'],
      });
    });
  });
});
```

---

### **3. Integration Tests**
**When:** Testing multiple components working together  
**Where:** `lib/__tests__/integration-*.test.ts`

**Example:** Testing form submission flow
```typescript
// lib/__tests__/integration-form-submission.test.ts
describe('Form Submission Flow', () => {
  it('creates form, submits data, and generates report', () => {
    // 1. Create form
    const form = createForm({ title: 'Health Check' });
    
    // 2. Submit data
    const submission = submitForm(form.id, { temp: 165 });
    
    // 3. Generate report
    const report = generateReport(form.id);
    
    expect(report.submissions).toHaveLength(1);
    expect(report.submissions[0].data.temp).toBe(165);
  });
});
```

---

## 🚀 **Step-by-Step: Adding a New Feature with Tests**

### **Example: Adding a "Recipe Calculator" Feature**

#### **Step 1: Plan**
```
Feature: Recipe scaling calculator
- Input: original recipe, serving size multiplier
- Output: scaled ingredient quantities
- Edge cases: multiplier <= 0, empty ingredients
```

#### **Step 2: Write Test First** ⭐
```typescript
// lib/__tests__/recipe-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { scaleRecipe } from '@/lib/recipe-calculator';

describe('Recipe Calculator', () => {
  it('doubles recipe quantities', () => {
    const recipe = {
      ingredients: [
        { name: 'flour', amount: 2, unit: 'cups' },
        { name: 'sugar', amount: 1, unit: 'cup' },
      ]
    };
    
    const scaled = scaleRecipe(recipe, 2);
    
    expect(scaled.ingredients[0].amount).toBe(4);
    expect(scaled.ingredients[1].amount).toBe(2);
  });
  
  it('handles fractional multipliers', () => {
    const recipe = {
      ingredients: [{ name: 'flour', amount: 4, unit: 'cups' }]
    };
    
    const scaled = scaleRecipe(recipe, 0.5);
    
    expect(scaled.ingredients[0].amount).toBe(2);
  });
  
  it('rejects invalid multipliers', () => {
    const recipe = { ingredients: [] };
    
    expect(() => scaleRecipe(recipe, 0)).toThrow('Multiplier must be positive');
    expect(() => scaleRecipe(recipe, -1)).toThrow('Multiplier must be positive');
  });
});
```

#### **Step 3: Run Test (It Will Fail)**
```bash
npm test
# ❌ Test fails because scaleRecipe() doesn't exist yet
```

#### **Step 4: Build the Feature**
```typescript
// lib/recipe-calculator.ts
export function scaleRecipe(recipe: Recipe, multiplier: number) {
  if (multiplier <= 0) {
    throw new Error('Multiplier must be positive');
  }
  
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      amount: ing.amount * multiplier,
    })),
  };
}
```

#### **Step 5: Run Test Again**
```bash
npm test
# ✅ Test passes!
```

#### **Step 6: Push to GitHub**
```bash
git add .
git commit -m "Add recipe scaling calculator with tests"
git push origin main
# 🤖 GitHub Actions runs all 720+ tests automatically
```

---

## 🎨 **Test Templates for Common Patterns**

### **Testing a New API Route**
```typescript
// app/api/YOUR_FEATURE/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('YOUR_FEATURE API', () => {
  describe('GET /api/YOUR_FEATURE', () => {
    it('returns list of items', () => {
      const items = getItems();
      expect(items).toBeArray();
    });
    
    it('handles empty state', () => {
      const items = getItems();
      expect(items).toHaveLength(0);
    });
  });
  
  describe('POST /api/YOUR_FEATURE', () => {
    it('creates new item', () => {
      const newItem = { name: 'Test' };
      const result = createItem(newItem);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test');
    });
    
    it('validates required fields', () => {
      expect(() => createItem({})).toThrow('Name is required');
    });
  });
});
```

---

### **Testing a Utility Function**
```typescript
// lib/__tests__/YOUR_UTIL.test.ts
import { describe, it, expect } from 'vitest';
import { yourFunction } from '@/lib/YOUR_UTIL';

describe('yourFunction', () => {
  it('handles normal case', () => {
    expect(yourFunction('input')).toBe('expected output');
  });
  
  it('handles edge case: empty input', () => {
    expect(yourFunction('')).toBe('default');
  });
  
  it('handles edge case: null input', () => {
    expect(yourFunction(null)).toBe(null);
  });
  
  it('throws on invalid input', () => {
    expect(() => yourFunction(-1)).toThrow();
  });
});
```

---

### **Testing Form Validation**
```typescript
// lib/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateFormData } from '@/lib/validation';

describe('Form Validation', () => {
  it('accepts valid data', () => {
    const data = { email: 'test@example.com', age: 25 };
    const result = validateFormData(data);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('rejects invalid email', () => {
    const data = { email: 'not-an-email', age: 25 };
    const result = validateFormData(data);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid email');
  });
  
  it('validates multiple fields', () => {
    const data = { email: 'invalid', age: -5 };
    const result = validateFormData(data);
    
    expect(result.errors).toHaveLength(2);
  });
});
```

---

## 🔍 **How to Know What to Test**

### **The "What Could Break?" Method**

For any new feature, ask:
1. **What's the happy path?** (normal use case)
2. **What edge cases exist?** (empty, null, zero, negative, very large)
3. **What could users do wrong?** (invalid input, wrong order)
4. **What could fail externally?** (API timeout, database error)

**Example: Adding a "Divide" function**
```typescript
describe('divide', () => {
  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);  // Happy path
  });
  
  it('handles decimals', () => {
    expect(divide(5, 2)).toBe(2.5);  // Edge case
  });
  
  it('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow();  // Error case
  });
});
```

---

## 📊 **Monitoring Test Coverage**

### **Check Current Coverage**
```bash
# Run tests with coverage report
npm test -- --coverage

# You'll see:
# ✅ Tested files: 92%
# ❌ Untested files: 8%
```

### **Identify Missing Tests**
```bash
# Find files without tests
find app/api -name "route.ts" | while read file; do
  test_file="${file%.ts}.test.ts"
  [ ! -f "${file%/route.ts}/__tests__/$(basename $test_file)" ] && echo "Missing: $file"
done
```

---

## 🎯 **Testing Goals by Feature Type**

| Feature Type | Target Coverage | Priority |
|--------------|----------------|----------|
| **API Routes** | 90%+ | 🔴 Critical |
| **Business Logic** | 95%+ | 🔴 Critical |
| **Database Queries** | 85%+ | 🟡 High |
| **Utilities** | 90%+ | 🟡 High |
| **Components** | 70%+ | 🟢 Medium |
| **Hooks** | 80%+ | 🟡 High |

---

## 🚦 **When Tests Should Block Your PR**

GitHub Actions will **block deployment** if:
- ❌ Any test fails
- ❌ Build fails
- ❌ Linter errors

**This is good!** It prevents bugs from reaching production.

---

## 💡 **Pro Tips**

### **1. Test Names Should Be User Stories**
```typescript
// ❌ Bad
it('test1', () => { ... });

// ✅ Good
it('prevents user from submitting form with invalid email', () => { ... });
```

### **2. One Assertion Per Test (When Possible)**
```typescript
// ❌ Testing too many things
it('user flow', () => {
  expect(createUser()).toBe(true);
  expect(loginUser()).toBe(true);
  expect(deleteUser()).toBe(true);
});

// ✅ Separate tests
it('creates user successfully', () => { ... });
it('allows user to login', () => { ... });
it('allows user deletion', () => { ... });
```

### **3. Use Descriptive Variable Names**
```typescript
// ❌ Unclear
const a = { n: 'Test', v: 123 };

// ✅ Clear
const validRecipe = { name: 'Test', servings: 123 };
```

---

## 🔄 **Your New Workflow**

**Every time you add a feature:**

```
1. Think: "What could break?"
2. Write test first (TDD)
3. Run: npm test (watch it fail)
4. Build feature
5. Run: npm test (watch it pass)
6. Push to GitHub
7. Robot verifies everything
8. Deploy automatically
```

---

## 📝 **Quick Reference Commands**

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with UI (visual interface)
npm run test:ui

# Run specific test file
npm test -- recipe-calculator.test.ts

# Run tests matching pattern
npm test -- --grep "Recipe"
```

---

## 🎓 **Learning Resources**

- **Vitest Docs:** https://vitest.dev/
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Your Test Files:** Look at `lib/__tests__/` for examples

---

## 🚀 **Next Steps**

1. **Read this guide** before adding new features
2. **Copy a test template** when starting
3. **Run tests frequently** (use watch mode)
4. **Let CI/CD do its job** (trust the robot!)

---

**Remember: Tests are your safety net. The more you have, the more confidently you can move fast!** 🏃‍♂️💨

---

*Last Updated: October 28, 2025*  
*Current Test Count: 720 tests*  
*Current Coverage: 92/100*

