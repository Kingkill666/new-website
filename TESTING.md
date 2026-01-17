# E2E Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing to ensure the VMF buy modal and wallet functionality work correctly.

## Setup

Playwright is already installed as a dev dependency. The browsers are installed automatically when you run the tests.

## Running Tests

### Prerequisites
Make sure your development server is running:
```bash
npm run dev
```
Wait for it to show "Ready in XXXXms" before running tests.

### Run all tests
```bash
npm run test
```

### Run tests with UI mode (visual test runner)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser windows)
```bash
npm run test:headed
```

### Run end-to-end tests (starts dev server automatically)
```bash
npm run test:e2e
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## CI/CD Integration

Tests automatically run on:
- **Push** to `main` or `prod` branches
- **Pull requests** targeting `main` or `prod` branches

### CI Features:
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Automatic dev server startup
- ✅ Test result artifacts uploaded
- ✅ Screenshots captured on failures
- ✅ 60-minute timeout protection

### Viewing CI Results:
1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. Download **playwright-report** artifact for detailed HTML reports
4. Download **test-results** artifact for screenshots/videos on failures

### Run specific test file
```bash
npx playwright test buy-modal.spec.ts
```

## Test Structure

- `tests/buy-modal.spec.ts` - Tests for the VMF buy modal functionality
  - Page loads without JavaScript errors
  - Buy modal can be opened without errors
  - Wallet connection UI works properly
  - No runtime JavaScript errors occur

## Configuration

The Playwright configuration is in `playwright.config.ts` and includes:
- Tests run against Chromium, Firefox, and WebKit
- Mobile viewport testing
- Automatic dev server startup
- HTML test reports

## CI/CD Integration

The tests are configured to work in CI environments with:
- Parallel test execution disabled in CI
- Retry logic for flaky tests
- Trace collection on failures

## Debugging Tests

### View test results
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug mode
```bash
npx playwright test --debug
```

### Step-by-step debugging
Add `await page.pause()` in your test to pause execution and inspect the page.

## Best Practices

1. **Test user journeys, not implementation details** - Focus on what users actually do
2. **Use descriptive test names** - Make it clear what functionality is being tested
3. **Handle async operations** - Use proper waits and assertions
4. **Test error scenarios** - Ensure graceful error handling
5. **Keep tests independent** - Each test should be able to run in isolation

## Adding New Tests

1. Create new test files in the `tests/` directory
2. Use the `.spec.ts` naming convention
3. Follow the existing patterns for setup and assertions
4. Add appropriate test descriptions and comments