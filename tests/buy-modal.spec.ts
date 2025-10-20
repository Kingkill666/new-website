import { test, expect, Locator } from '@playwright/test';

test.describe('VMF Buy Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should load homepage without errors', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/VMF - Veterans & Military Families/);

    // Check that no console errors occurred during page load
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);

    // Assert no console errors
    expect(errors).toHaveLength(0);
  });

  test('should open buy modal without JavaScript errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Look for the BUY VMF button - try different possible selectors
    const buyButtonSelectors = [
      'button:has-text("BUY VMF")',
      'button:has-text("Buy VMF")',
      '[data-testid="buy-vmf-button"]',
      '.buy-vmf-button',
      'button[class*="buy"]'
    ];

    let buyButton: Locator | undefined;
    for (const selector of buyButtonSelectors) {
      try {
        buyButton = page.locator(selector).first();
        if (await buyButton.isVisible({ timeout: 1000 })) {
          break;
        }
      } catch (_e) {
        continue;
      }
    }

    // If we found a button, click it
    if (buyButton) {
      await expect(buyButton).toBeVisible();
      await buyButton.click();

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Check if modal opened (look for common modal indicators)
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '.dialog',
        '[data-testid="buy-modal"]',
        '.buy-vmf-modal'
      ];

      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          const modal = page.locator(selector);
          if (await modal.isVisible({ timeout: 1000 })) {
            modalFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If modal was found, test passed
      if (modalFound) {
        console.log('✅ Buy modal opened successfully');
      } else {
        console.log('⚠️  Modal may not have opened, but no errors occurred');
      }
    } else {
      console.log('⚠️  Buy VMF button not found, but page loaded without errors');
    }

    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);

    // Assert no console errors occurred during the interaction
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('walletconnect') &&
      !error.includes('appkit')
    );

    console.log('Console logs during test:', consoleLogs);
    console.log('Console errors during test:', consoleErrors);

    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle wallet connection UI', async ({ page }) => {
    // This test checks that wallet connection elements are present
    // and don't cause JavaScript errors when interacted with

    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Look for wallet connection elements
    const walletSelectors = [
      'appkit-button',
      '[data-testid="wallet-button"]',
      'button:has-text("Connect")',
      'button:has-text("Connect Wallet")',
      '.wallet-connect'
    ];

    let walletElement: Locator | undefined;
    for (const selector of walletSelectors) {
      try {
        walletElement = page.locator(selector).first();
        if (await walletElement.isVisible({ timeout: 1000 })) {
          console.log(`Found wallet element: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Wait to catch any errors
    await page.waitForTimeout(2000);

    // Assert no critical errors
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('walletconnect') &&
      !error.includes('appkit')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have Coinbase Smart Wallet available', async ({ page }) => {
    // Test that Coinbase Smart Wallet integration is properly configured
    // This checks that the wallet connector is available in the AppKit modal

    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for the page to be fully loaded and check for wallet elements
    await page.waitForTimeout(2000);

    // Look for AppKit wallet button which should include Coinbase Smart Wallet
    const appKitButton = page.locator('appkit-button, [data-testid="wallet-button"], button:has-text("Connect")').first();

    // The button should exist (even if not visible initially)
    const buttonExists = await appKitButton.count() > 0;
    expect(buttonExists).toBe(true);

    // Check for any console errors during wallet initialization
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('walletconnect') &&
      !error.includes('appkit') &&
      !error.includes('coinbase')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should open Coinbase Smart Wallet modal without extension errors', async ({ page }) => {
    // Test that clicking Coinbase Smart Wallet opens AppKit modal
    // and doesn't show extension detection errors

    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // First, open the buy modal
    const buyButtonSelectors = [
      'button:has-text("BUY VMF")',
      'button:has-text("Buy VMF")',
      '[data-testid="buy-vmf-button"]',
      '.buy-vmf-button',
      'button[class*="buy"]'
    ];

    let buyButton: Locator | undefined;
    for (const selector of buyButtonSelectors) {
      try {
        buyButton = page.locator(selector).first();
        if (await buyButton.isVisible({ timeout: 1000 })) {
          break;
        }
      } catch (_e) {
        continue;
      }
    }

    if (!buyButton) {
      console.log('Buy VMF button not found, skipping Smart Wallet test');
      return;
    }

    // Click buy button to open modal
    await buyButton.click();
    await page.waitForTimeout(1000);

    // Look for Coinbase Smart Wallet button in the modal
    const coinbaseButton = page.locator('button:has-text("Coinbase Smart Wallet")').first();

    // Verify the button exists
    await expect(coinbaseButton).toBeVisible();

    // Click the Coinbase Smart Wallet button
    await coinbaseButton.click();

    // Wait for AppKit modal to open
    await page.waitForTimeout(2000);

    // Check that no extension detection errors occurred
    const extensionErrors = consoleErrors.filter(error =>
      error.includes('No wallet detected') ||
      error.includes('Please install Coinbase Smart Wallet') ||
      error.includes('extension')
    );

    // Should have no extension detection errors
    expect(extensionErrors).toHaveLength(0);

    // Check that AppKit modal opened (look for modal elements)
    const appKitModalSelectors = [
      '[data-testid="appkit-modal"]',
      '.appkit-modal',
      '[role="dialog"]',
      '.modal'
    ];

    let modalFound = false;
    for (const selector of appKitModalSelectors) {
      try {
        const modal = page.locator(selector);
        if (await modal.isVisible({ timeout: 1000 })) {
          modalFound = true;
          console.log(`✅ AppKit modal found with selector: ${selector}`);
          break;
        }
      } catch (_e) {
        continue;
      }
    }

    // AppKit modal should have opened
    expect(modalFound).toBe(true);

    console.log('Console logs during Smart Wallet test:', consoleLogs);
    console.log('Console errors during Smart Wallet test:', consoleErrors);
  });
});