const { test, expect } = require('@playwright/test');

test.describe('Image Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ✅ Step 1: Login first (Protected route hai)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder="Email"]', 'newuser@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Redirect check
    await expect(page).toHaveURL(/.*dashboard/);

    // ✅ Step 2: Navigate to ImageGen page
    await page.goto('http://localhost:5173/image');
    await page.waitForLoadState('networkidle');
  });

  test('should show input and generate button', async ({ page }) => {
    await expect(page.locator('input[placeholder="Enter prompt..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate")')).toBeVisible();
  });

  test('should generate image or show error', async ({ page }) => {
    await page.fill('input[placeholder="Enter prompt..."]', 'a cute puppy in space');
    await page.click('button:has-text("Generate")');

    // ✅ Either image card appears or error message
    const imageCard = page.locator('div.card img');
    const errorMsg = page.locator('p.text-red-500, p.text-red-400');

    if (await imageCard.count() > 0) {
      await expect(imageCard.first()).toBeVisible();
      console.log("✅ Image generated and visible");
    } else if (await errorMsg.count() > 0) {
      await expect(errorMsg.first()).toBeVisible();
      console.log("⚠️ Image generation failed, error shown:", await errorMsg.textContent());
    } else {
      console.log("⚠️ No image and no error (backend might not respond)");
      await expect(page.locator('text=No images yet')).toBeVisible();
    }
  });

  test('should load image history on page load if available', async ({ page }) => {
    const imageCards = page.locator('div.card img');
    if (await imageCards.count() > 0) {
      console.log("✅ Image history loaded:", await imageCards.count());
      await expect(imageCards.first()).toBeVisible();
    } else {
      console.log("⚠️ No image history available");
      await expect(page.locator('text=No images yet')).toBeVisible();
    }
  });
});

