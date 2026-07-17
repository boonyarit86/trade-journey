import { test, expect, request as playwrightRequest, type APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4000';

const suffix = Date.now().toString().slice(-6);
const projectName = `E2EProj${suffix}`;
const assetTypeName = `E2EAT${suffix}`;
const assetName = `E2EAS${suffix}`;
const portfolioName = `E2EPort${suffix}`;
const portfolioNameUpdated = `E2EUpd${suffix}`;

let projectId: string;
let assetTypeId: string;
let assetId: string;
let createdPortfolioId: string | undefined;

test.describe('Portfolio page', () => {
    test.beforeAll(async () => {
        // Fixtures (Project/AssetType/Asset) are created directly via the API so the
        // Portfolio form has existing records to select from, without depending on
        // other pages' table pagination/UI state.
        const api: APIRequestContext = await playwrightRequest.newContext({ baseURL: API_BASE_URL });

        const projectRes = await api.post('/project', { data: { name: projectName } });
        projectId = (await projectRes.json()).data.id;

        const assetTypeRes = await api.post('/asset/type', { data: { name: assetTypeName } });
        assetTypeId = (await assetTypeRes.json()).data.id;

        const assetRes = await api.post('/asset', { data: { name: assetName, assetTypeId } });
        assetId = (await assetRes.json()).data.id;

        await api.dispose();
    });

    test.afterAll(async () => {
        const api: APIRequestContext = await playwrightRequest.newContext({ baseURL: API_BASE_URL });
        try {
            if (createdPortfolioId) await api.delete(`/portfolio/${createdPortfolioId}`);
            if (assetId) await api.delete(`/asset/${assetId}`);
            if (assetTypeId) await api.delete(`/asset/type/${assetTypeId}`);
            if (projectId) await api.delete(`/project/${projectId}`);
        } finally {
            await api.dispose();
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/trading-setup/portfolio');
        await page.waitForSelector('table', { timeout: 10000 });
    });

    test('should display the Portfolio page with title and New Portfolio button', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'New Portfolio' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should open modal when clicking New Portfolio', async ({ page }) => {
        await page.getByRole('button', { name: 'New Portfolio' }).click();
        await expect(page.locator('.ant-modal')).toBeVisible();
        await expect(page.locator('.ant-modal-title')).toContainText('Portfolio');
    });

    test('should create a new portfolio', async ({ page }) => {
        await page.getByRole('button', { name: 'New Portfolio' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Name').fill(portfolioName);

        await page.getByLabel('Project').click();
        await page.getByTitle(projectName, { exact: true }).click();

        await page.getByLabel('Asset').click();
        await page.getByTitle(new RegExp(assetName)).click();

        await page.getByLabel('Balance').fill('1000');

        const [createResponse] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/portfolio') && res.request().method() === 'POST'),
            page.getByRole('button', { name: 'Save' }).click(),
        ]);
        createdPortfolioId = (await createResponse.json()).data?.id;
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(portfolioName)).toBeVisible({ timeout: 10000 });
    });

    test('should edit a portfolio via View button', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(portfolioName) });
        await row.getByText('View').click();
        await page.locator('.ant-modal').waitFor({ state: 'visible' });

        await page.getByLabel('Name').clear();
        await page.getByLabel('Name').fill(portfolioNameUpdated);

        await page.getByRole('button', { name: 'Save' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        await expect(page.getByText(portfolioNameUpdated)).toBeVisible({ timeout: 10000 });
    });

    test('should toggle portfolio active status', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(portfolioNameUpdated) });
        const toggle = row.locator('.ant-switch');
        const isChecked = await toggle.getAttribute('aria-checked');

        await toggle.click();

        if (isChecked === 'true') {
            await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
        } else {
            await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
        }
    });

    test('should filter portfolio table by project', async ({ page }) => {
        const filterIcon = page.locator('th', { hasText: 'Project' }).locator('.ant-table-filter-trigger');
        await filterIcon.click();

        const filterDropdown = page.locator('.ant-table-filter-dropdown');
        await filterDropdown.waitFor({ state: 'visible' });
        await filterDropdown.getByText(projectName, { exact: true }).click();
        await filterDropdown.getByRole('button', { name: 'OK' }).click();

        await expect(page.getByText(portfolioNameUpdated)).toBeVisible({ timeout: 10000 });
    });

    test('should delete a portfolio', async ({ page }) => {
        const row = page.getByRole('row', { name: new RegExp(portfolioNameUpdated) });
        await row.getByText('Delete').click();

        await expect(page.getByText(portfolioNameUpdated)).not.toBeVisible({ timeout: 10000 });
        createdPortfolioId = undefined;
    });
});
