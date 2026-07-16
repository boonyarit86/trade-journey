import { test, expect } from '@playwright/test';

const suffix = Date.now().toString().slice(-6);
const strategyName = `E2EStrat${suffix}`;
const strategyNameUpdated = `E2EUpd${suffix}`;

test.describe('Strategy page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/trading-setup/strategy');
        await page.waitForSelector('table', { timeout: 10000 });
    });

    test('should display the Strategy page with title and New Strategy button', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Strategy' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'New Strategy' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should open modal when clicking New Strategy', async ({ page }) => {
        await page.getByRole('button', { name: 'New Strategy' }).click();
        await expect(page.locator('.ant-modal')).toBeVisible();
        await expect(page.locator('.ant-modal-title')).toContainText('Strategy');
    });

    test('should create a new strategy', async ({ page }) => {
        await page.getByRole('button', { name: 'New Strategy' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Name').fill(strategyName);
        await page.getByLabel('Risk/Reward Ratio').fill('2');
        await page.getByLabel('Risk Per Trade (%)').fill('1');
        await page.getByLabel('Description').fill('E2E test strategy');

        await page.getByRole('button', { name: 'Save' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(strategyName)).toBeVisible({ timeout: 10000 });
    });

    test('should edit a strategy via View button', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(strategyName) });
        await row.getByText('View').click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Name').clear();
        await page.getByLabel('Name').fill(strategyNameUpdated);

        await page.getByRole('button', { name: 'Save' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(strategyNameUpdated)).toBeVisible({ timeout: 10000 });
    });

    test('should toggle strategy active status', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(strategyNameUpdated) });
        const toggle = row.locator('.ant-switch');
        const isChecked = await toggle.getAttribute('aria-checked');

        await toggle.click();

        if (isChecked === 'true') {
            await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
        } else {
            await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
        }
    });

    test('should delete a strategy', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(strategyNameUpdated) });
        await row.getByText('Delete').click();

        await expect(page.getByText(strategyNameUpdated)).not.toBeVisible({ timeout: 10000 });
    });
});
