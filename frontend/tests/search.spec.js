const { test, expect } = require('@playwright/test');

test.describe('Search Page Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ✅ Step 1: Login first (protected route hai)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder="Email"]', 'newuser@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');

    // ✅ Step 2: Redirect check after login
    await expect(page).toHaveURL(/.*dashboard/);

    // ✅ Step 3: Navigate to search page
    await page.goto('http://localhost:5173/search');
    await page.waitForLoadState('networkidle');
  });

  test('should show input and button', async ({ page }) => {
    await expect(page.locator('input[placeholder="Type your query..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Search")')).toBeVisible();
  });

  test('should perform search and show results or empty message', async ({ page }) => {
    await page.fill('input[placeholder="Type your query..."]', 'playwright testing');
    await page.click('button:has-text("Search")');

    const resultItems = page.locator('ul >> li.card');
    if (await resultItems.count() > 0) {
      await expect(resultItems.first()).toBeVisible();
      console.log("✅ Search results loaded:", await resultItems.count());
    } else {
      await expect(page.locator('text=No results found')).toBeVisible();
      console.log("⚠️ No results returned from backend");
    }
  });

  test('should load history on page load if available', async ({ page }) => {
    const historyItems = page.locator('ul >> li.card');
    if (await historyItems.count() > 0) {
      console.log("✅ Search history loaded:", await historyItems.count());
      await expect(historyItems.first()).toBeVisible();
    } else {
      console.log("⚠️ No search history available");
      await expect(page.locator('text=No results found')).toBeVisible();
    }
  });
});
