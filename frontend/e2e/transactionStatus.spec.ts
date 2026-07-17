import { test, expect, request as playwrightRequest, type APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4000';

const suffix = Date.now().toString().slice(-6);
const statusText = `E2ESts${suffix}`;
const statusValue = `E${suffix.slice(-2)}`;
const statusTextUpdated = `E2EUpd${suffix}`;

let createdId: string | undefined;

test.describe('Trade Result page', () => {
    test.afterAll(async () => {
        if (!createdId) return;
        const api: APIRequestContext = await playwrightRequest.newContext({ baseURL: API_BASE_URL });
        try {
            await api.delete(`/transaction-status/${createdId}`);
        } catch {
            // ignore — no delete endpoint; row left in DB as test data
        } finally {
            await api.dispose();
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/general-setting/trade-result');
        await page.waitForSelector('table', { timeout: 10000 });
    });

    test('should display the Trade Result page with title and New Status button', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Trade Result' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'New Status' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should open modal when clicking New Status', async ({ page }) => {
        await page.getByRole('button', { name: 'New Status' }).click();
        await expect(page.locator('.ant-modal')).toBeVisible();
        await expect(page.locator('.ant-modal-title')).toContainText('Trade Result');
    });

    test('should create a new transaction status', async ({ page }) => {
        await page.getByRole('button', { name: 'New Status' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Text').fill(statusText);
        await page.getByLabel('Value').fill(statusValue);
        await page.getByLabel('Color Code').fill('#123456');

        const [createResponse] = await Promise.all([
            page.waitForResponse(
                (res) =>
                    res.url().includes('/transaction-status') &&
                    res.request().method() === 'POST',
            ),
            page.getByRole('button', { name: 'Save' }).click(),
        ]);
        createdId = (await createResponse.json()).data?.id;
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(statusText)).toBeVisible({ timeout: 10000 });
    });

    test('should edit a transaction status via View button', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(statusText) });
        await row.getByText('View').click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Text').clear();
        await page.getByLabel('Text').fill(statusTextUpdated);

        await page.getByRole('button', { name: 'Save' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(statusTextUpdated)).toBeVisible({ timeout: 10000 });
    });

    test('should toggle transaction status active flag', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(statusTextUpdated) });
        const toggle = row.locator('.ant-switch');
        const isChecked = await toggle.getAttribute('aria-checked');

        await toggle.click();

        if (isChecked === 'true') {
            await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
        } else {
            await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
        }
    });
});
