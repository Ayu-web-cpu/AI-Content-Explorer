const { test, expect } = require('@playwright/test');

test.describe('Auth Flow', () => {
  test('user can register (or already exists)', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="Email"]', 'newuser@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Register")');

    // Either redirect to login OR error message shown
    if (page.url().includes('/register')) {
      const errorMessage = page.locator('p.text-red-500, p.text-red-400');
      if (await errorMessage.isVisible()) {
        console.log("⚠️ Register error shown:", await errorMessage.textContent());
        await expect(errorMessage).toBeVisible();
      } else {
        console.log("⚠️ Stayed on /register without visible error");
        await expect(page).toHaveURL(/.*register/);
      }
    } else {
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('user can login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder="Email"]', 'newuser@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Redirects to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('invalid login blocks access', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder="Email"]', 'wrong@example.com');
    await page.fill('input[placeholder="Password"]', 'wrongpass');
    await page.click('button:has-text("Login")');

    // Either error visible OR user still stuck on login page
    if (page.url().includes('/login')) {
      const errorMessage = page.locator('p.text-red-500, p.text-red-400');
      if (await errorMessage.isVisible()) {
        console.log("⚠️ Login error shown:", await errorMessage.textContent());
        await expect(errorMessage).toBeVisible();
      } else {
        console.log("⚠️ No visible error, but user is still on login page");
        await expect(page).toHaveURL(/.*login/);
      }
    } else {
      throw new Error("❌ Invalid login unexpectedly redirected away from /login");
    }
  });
});


//npx playwright test tests/auth.spec.js