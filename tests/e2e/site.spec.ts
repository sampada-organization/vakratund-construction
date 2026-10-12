import { expect, test } from '@playwright/test';

const pages = ['/', '/projects', '/services', '/services/roads', '/materials', '/materials/bitumen', '/plant', '/process', '/clients', '/clients/sany', '/clients/stanley-black-decker', '/profile', '/resources', '/guide', '/identity', '/contact', '/onboard', '/meet', '/admin', '/legal/privacy'];

test('home states the work and the real phone', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Vakratund Construction/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vakratund Construction');
  await expect(page.locator('.tagline')).toHaveText("Civil construction for Chakan's plants, homes, and public work.");
  await expect(page.getByRole('link', { name: /Call 99605 32729/i }).first()).toHaveAttribute('href', 'tel:+919960532729');
  await expect(page.getByRole('link', { name: 'WhatsApp' }).first()).toHaveAttribute('href', /wa\.me\/919960532729/);
  await expect(page.getByRole('link', { name: 'Book a visit' }).first()).toHaveAttribute('href', /\/meet$/);
  await expect(page.getByRole('link', { name: /missed call/i })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('9970099700');
  await expect(page.locator('body')).not.toContainText('VAKARTUND');
  await expect(page.locator('body')).toContainText('vakratundconstruction.in');
  await expect(page.locator('.hero-film img.is-on')).toBeVisible();
  await expect(page.locator('.hero-film img.is-on')).toHaveAttribute('src', /sany-7\.jpg/);
  await expect(page.getByRole('heading', { name: 'SANY, Chakan' })).toBeVisible();
  await expect(page.locator('.study')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Plant at a glance' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /view full/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next slide' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /previous clients/i })).toHaveCount(0);
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.locator('#work .work-tabs')).toHaveCount(0);
  await expect(page.locator('.beam')).toBeVisible();
  await expect(page.getByText('The top shortens. The bottom stretches.')).toBeVisible();
  const caption = page.locator('.hero-caption .is-on p');
  const ratio = await caption.evaluate((el) => {
    const style = getComputedStyle(el);
    return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
  });
  expect(ratio).toBeGreaterThan(1.4);
  await expect(page.locator('#tools').getByText('Transit mixer')).toBeVisible();
  await expect(page.locator('#tools').getByText('5', { exact: true })).toHaveCount(0);
  await expect(page.locator('#tools a').first()).toHaveAttribute('href', /\/plant$/);
  await expect(page.getByRole('link', { name: 'Further: Plant and tools' }).first()).toHaveAttribute('href', /\/plant$/);
  await expect(page.locator('#clients').getByText('Stanley Black & Decker', { exact: true })).toBeVisible();
  await expect(page.locator('#clients').getByText('Black+Decker')).toHaveCount(0);
  await expect(page.locator('#work .filters')).toHaveCount(0);
  await expect(page.locator('#work .work-grid small').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Further: All work' })).toHaveAttribute('href', /\/projects$/);
  await expect(page.locator('.service-grid')).toHaveCount(0);
  const workImage = page.locator('#work .work-grid img').first();
  await expect(workImage).toBeVisible();
  const workHeight = await workImage.evaluate((el) => el.getBoundingClientRect().height);
  expect(workHeight).toBeGreaterThan(180);
  await expect(page.locator('.yard-bits')).toHaveCount(0);
  await page.locator('.hero-film').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'The ground' })).toBeVisible();
  await expect(page.locator('.hero-film img.is-on')).toHaveAttribute('src', /sany-2\.jpg/);
  const film = page.locator('.hero-film');
  const sample = await film.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width * 0.82);
    const y = Math.round(rect.top + rect.height * 0.38);
    const canvas = document.createElement('canvas');
    const shot = el.querySelector('img.is-on') as HTMLImageElement | null;
    if (!shot || !shot.naturalWidth) return { x, y, rgb: [0, 0, 0] };
    canvas.width = shot.naturalWidth;
    canvas.height = shot.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { x, y, rgb: [0, 0, 0] };
    ctx.drawImage(shot, 0, 0);
    const px = Math.min(shot.naturalWidth - 1, Math.round(shot.naturalWidth * 0.72));
    const py = Math.min(shot.naturalHeight - 1, Math.round(shot.naturalHeight * 0.35));
    const data = ctx.getImageData(px, py, 1, 1).data;
    return { x, y, rgb: [data[0], data[1], data[2]] };
  });
  expect(sample.rgb[0] + sample.rgb[1] + sample.rgb[2]).toBeGreaterThan(40);
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: false });
  for (const id of ['work', 'bend', 'clients', 'tools']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/home-${id}-${testInfo.project.name}.png`, fullPage: false });
  }
  await page.getByRole('link', { name: 'Bridge work' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bridge work');
  await expect(page.getByRole('link', { name: 'Book a visit about this work' })).toHaveAttribute('href', /\/meet\?topic=/);
});

test('mobile menu reaches the plant', async ({ page }, testInfo) => {
  await page.goto('/');
  const menu = page.getByRole('banner').getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Plant' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plant and tools');
  await expect(page.getByText('Transit mixer')).toBeVisible();
  await expect(page.getByText('5', { exact: true })).toHaveCount(0);
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

test('a material keeps its method, procedure, and a lazy photograph', async ({ page }) => {
  await page.goto('/materials');
  await page.getByRole('link', { name: /Bitumen/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Method' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Procedure' })).toBeVisible();
  await expect(page.locator('.photo-row img').first()).toHaveAttribute('loading', 'lazy');
  await page.getByRole('link', { name: /Bitumen roads/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bitumen roads');
  await expect(page.getByRole('heading', { name: 'Method' })).toBeVisible();
});

test('work photograph is sized and lazy on the index', async ({ page }, testInfo) => {
  await page.goto('/projects');
  const image = page.locator('.work-grid img').first();
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('width', /\d+/);
  await expect(page.getByRole('button', { name: 'Use', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Road', exact: true }).click();
  await expect(page.locator('.work-grid').getByRole('link', { name: /Bitumen roads/ })).toBeVisible();
  await expect(page.locator('.work-grid').getByRole('link', { name: /Gabion wall/ })).toBeHidden();
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

test('a client page shows the work filed for that plant', async ({ page }) => {
  await page.goto('/clients');
  await page.getByRole('link', { name: 'SANY' }).click();
  await expect(page).toHaveURL(/\/clients\/sany$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SANY');
  await expect(page.locator('img[src*="sany-7.jpg"]')).toBeVisible();
  await page.goto('/clients/stanley-black-decker');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stanley Black & Decker');
  await expect(page.getByText('Photographs of work at this plant are not on the site yet.')).toBeVisible();
  await expect(page.locator('img[src*="black-decker.png"]')).toBeVisible();
  await page.goto('/profile');
  await expect(page.getByRole('link', { name: 'Prajot Vikas Dhadge' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/prajot-dhadge-190301100/',
  );
  await page.goto('/guide');
  const figures = page.locator('.guide-fig img');
  await expect(figures).toHaveCount(5);
  await expect
    .poll(() => figures.evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0)))
    .toBe(true);
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
  await page.getByLabel('Work').selectOption('Foundations');
  await page.getByRole('button', { name: 'Come on board' }).click();
  await expect(page.locator('[data-result]')).toContainText('Received');
});

test('the office editor opens with the password and lists services', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Password').fill('vakratund-dev');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('[data-list="services"] input').first()).toHaveValue('roads');
  await expect(page.locator('[data-list="materials"] input').first()).toHaveValue('bitumen');
  await expect(page.locator('[data-list="pages"] input').first()).toHaveValue('Work');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
});
