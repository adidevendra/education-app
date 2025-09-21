import { test, expect } from '@playwright/test';

test('browse catalog and open a course', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /catalog/i }).click();
  await expect(page).toHaveURL(/catalog/);
  // Open first course card if present
  const links = page.locator('a').filter({ hasText: /course/i }).first();
  if (await links.count()) {
    await links.click();
    await expect(page).toHaveURL(/course/);
  }
});
