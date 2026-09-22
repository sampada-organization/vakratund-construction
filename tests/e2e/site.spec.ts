import { expect, test } from '@playwright/test';

const pages = ['/', '/projects', '/plant', '/process', '/clients', '/resources', '/identity', '/contact', '/onboard', '/meet', '/admin', '/legal/privacy'];

test('home states the work and the real phone', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Vakratund Construction/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vakratund Construction');
  await expect(page.locator('.tagline')).toHaveText('We build structures you desire.');
  await expect(page.getByRole('link', { name: /Call 99605 32729/i }).first()).toHaveAttribute('href', 'tel:+919960532729');
  await expect(page.getByRole('link', { name: 'WhatsApp' }).first()).toHaveAttribute('href', /wa\.me\/919960532729/);
  await expect(page.getByRole('link', { name: /missed call/i })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('9970099700');
  await expect(page.locator('body')).not.toContainText('VAKARTUND');
  await expect(page.locator('.rise-svg')).toBeVisible();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: false });
});

test('mobile menu reaches the plant', async ({ page }, testInfo) => {
  await page.goto('/');
  const menu = page.getByRole('banner').getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Plant' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plant and tools');
  await expect(page.getByText('Transit mixer')).toBeVisible();
  await page.screenshot({ path: `test-results/plant-${testInfo.project.name}.png`, fullPage: false });
});

test('inner pages answer', async ({ page }) => {
  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.ok(), path).toBeTruthy();
    await expect(page.locator('main h1')).toBeVisible();
  }
  const missing = await page.goto('/not-a-page');
  expect(missing?.status()).toBe(404);
});

test('work photograph is sized and lazy on the index', async ({ page }, testInfo) => {
  await page.goto('/projects');
  const image = page.locator('.work-grid img').first();
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('width', /\d+/);
  await page.screenshot({ path: `test-results/work-${testInfo.project.name}.png`, fullPage: false });
  await page.goto('/projects/bitumen-roads');
  await expect(page.locator('figure img').first()).toHaveAttribute('fetchpriority', 'high');
});

test('contact form blocks an empty send', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send to the office' }).click();
  await expect(page.locator('form :invalid')).not.toHaveCount(0);
});

test('a visit opens WhatsApp, email, and a calendar file', async ({ page }, testInfo) => {
  await page.goto('/meet');
  await page.locator('input[name="started_at"]').evaluate((el: HTMLInputElement) => {
    el.value = String(Date.now() - 10_000);
  });
  await page.getByLabel('Your name').fill('Site Owner');
  await page.getByLabel('Phone').fill('9845012345');
  await page.locator('input[name="when"]').fill('2026-10-02T10:30');
  await page.getByLabel('Work').selectOption('Road construction');
  await page.getByRole('button', { name: 'Book the visit' }).click();
  const result = page.locator('[data-result]');
  await expect(result.getByRole('link', { name: 'Open WhatsApp' })).toHaveAttribute('href', /wa\.me\/919960532729/);
  await expect(result.getByRole('link', { name: 'Open email' })).toHaveAttribute('href', /^mailto:vakratundconstructionchakan@gmail.com/);
  await expect(result.getByRole('link', { name: 'Give a missed call' })).toHaveCount(0);
  await expect(result.getByRole('link', { name: 'Add to calendar' })).toHaveAttribute('href', /^blob:/);
  await page.screenshot({ path: `test-results/meet-${testInfo.project.name}.png`, fullPage: false });
});

test('a client can come on board', async ({ page }) => {
  await page.goto('/onboard');
  await page.locator('input[name="started_at"]').evaluate((el: HTMLInputElement) => {
    el.value = String(Date.now() - 10_000);
  });
  await page.getByLabel('Firm or house name').fill('Patil House');
  await page.getByLabel('Your name').fill('A. Patil');
  await page.getByLabel('Phone').fill('9845012345');
  await page.getByLabel('Site location').fill('Chakan');
  await page.getByLabel('Work').selectOption('Civil works');
  await page.getByRole('button', { name: 'Come on board' }).click();
  await expect(page.locator('[data-result]')).toContainText('Received');
});

test('the office editor opens with the password and lists services', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Password').fill('vakratund-dev');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('[data-list="services"] input').first()).toHaveValue('Building construction');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
});
