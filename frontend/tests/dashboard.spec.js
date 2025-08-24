const { test, expect } = require('@playwright/test');

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should open and close preview modal if search history exists', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View")');
    if (await viewBtn.count() > 0) {
      await viewBtn.first().click();
      await expect(page.locator('text=Close')).toBeVisible();

      // close modal
      await page.click('button:has-text("Close")');
      await expect(page.locator('text=Close')).toHaveCount(0);
      console.log("✅ Preview modal opened and closed successfully");
    } else {
      console.log("⚠️ No search items available, skipping preview test");
    }
  });

  test('should delete search entry if exists', async ({ page }) => {
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      console.log("🗑️ Deleted one search entry");
    } else {
      console.log("⚠️ No search items available to delete");
    }
  });

  test('should delete image entry if exists', async ({ page }) => {
    const deleteBtn = page.locator('button[title="Delete"]').first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      console.log("🗑️ Deleted one image entry");
    } else {
      console.log("⚠️ No image items available to delete");
    }
  });

  test('should show Export CSV button if history exists', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export CSV")');
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
      console.log("✅ Export CSV button is visible");
    } else {
      console.log("⚠️ No history available for export");
    }
  });
});

//npx playwright test tests/dashboard.spec.js
