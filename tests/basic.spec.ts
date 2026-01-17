import { test, expect } from '@playwright/test';

test.describe('Basic Page Load', () => {
  test('should load homepage', async ({ page }) => {
    console.log('Starting test...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    const title = await page.title();
    console.log('Page title:', title);

    expect(title).toContain('VMF');
    console.log('Test passed!');
  });
});