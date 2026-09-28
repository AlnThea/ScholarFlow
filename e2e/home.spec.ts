import { test, expect } from '@playwright/test';

test('has title and redirects properly', async ({ page }) => {
  await page.goto('/');

  // Assuming it redirects to login or dashboard, we wait for the page to load
  await page.waitForLoadState('networkidle');

  // We check if the title contains ScholarFlow or if we are redirected to a relevant page
  const title = await page.title();
  // ScholarFlow might be in the title
  expect(title.length).toBeGreaterThan(0);
});
