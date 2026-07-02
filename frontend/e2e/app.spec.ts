import { test, expect } from '@playwright/test';

test.describe('Learning Journal E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Learning Journal/);
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('react');
    await expect(searchInput).toHaveValue('react');
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    const journalLink = page.getByText(/journal/i);
    await journalLink.click();
    await expect(page).toHaveURL(/.*journal/);
  });
});
