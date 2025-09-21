import { test, expect } from '@playwright/test';

test.describe('PlayerShell demo', () => {
  test('caption toggle, language switch, glossary open', async ({ page }) => {
    await page.goto('/demo/player');
    await expect(page.getByRole('heading', { name: 'Player Demo' })).toBeVisible();

    const langBtn = page.getByRole('button', { name: /toggle-language/i }).or(page.getByRole('button', { name: /Lang:/i }));
    const ccBtn = page.getByLabel(/toggle-captions/i);
    const glossaryBtn = page.getByLabel(/toggle-glossary/i);

    await expect(ccBtn).toBeVisible();
    await expect(glossaryBtn).toBeVisible();

    // Toggle captions off then on
    await ccBtn.click();
    await ccBtn.click();

    // Open glossary
    await glossaryBtn.click();
    await expect(page.getByRole('complementary', { name: /glossary/i })).toBeVisible();

    // Switch language
    await langBtn.click();
  });

  test('seek accuracy within ±100ms', async ({ page }) => {
    await page.goto('/demo/player');
    const video = page.locator('video');
    await expect(video).toBeVisible();
    // Wait small delay to ensure metadata loaded
    await page.waitForTimeout(500);
    // Jump to 5s
    await page.evaluate(() => { const v = document.querySelector('video')!; v.currentTime = 5; });
    await page.waitForTimeout(200);
    const t = await page.evaluate(() => document.querySelector('video')!.currentTime);
    expect(Math.abs(t - 5)).toBeLessThan(0.1);
  });
});
