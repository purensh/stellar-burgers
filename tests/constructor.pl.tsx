import { expect, test } from '@playwright/test';

import { bun, mains, sauce } from '../src/services/slices/mocks';

import type { BrowserContext, Locator, Page } from '@playwright/test';

const HAR_PATH = './tests/hars/burger-api.har';
const ORDER_NUMBER = 123456;

const getConstructor = (page: Page): Locator =>
  page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });

const getModal = (page: Page): Locator => page.getByTestId('modal');

const addIngredient = async (page: Page, name: string): Promise<void> => {
  const card = page
    .locator('li')
    .filter({ hasText: name })
    .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

  await card.getByRole('button', { name: 'Добавить' }).click();
};

const preparePage = async (page: Page, context: BrowserContext): Promise<void> => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: 'fake-access-token',
      url: 'http://localhost:4000',
    },
  ]);

  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'fake-refresh-token');
  });

  await page.routeFromHAR(HAR_PATH, { url: '**/api/**' });

  await page.goto('/');
  await expect(page.getByText('Краторная булка N-200i').first()).toBeVisible();
};

test.beforeEach(async ({ page, context }) => {
  await preparePage(page, context);
});

test.describe('добавление ингредиентов в конструктор', () => {
  test('добавляет один ингредиент в конструктор', async ({ page }) => {
    const main = mains[0];
    const constructor = getConstructor(page);

    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    await expect(constructor.getByText(main.name, { exact: true })).toHaveCount(0);

    await addIngredient(page, main.name);

    await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeHidden();
  });

  test('добавляет булку и начинки в конструктор', async ({ page }) => {
    const constructor = getConstructor(page);

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    await expect(constructor.getByText(bun.name, { exact: true })).toHaveCount(0);

    await addIngredient(page, bun.name);

    for (const main of mains) {
      await expect(constructor.getByText(main.name, { exact: true })).toHaveCount(0);
      await addIngredient(page, main.name);
    }

    await expect(constructor.getByText(`${bun.name} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${bun.name} (низ)`)).toBeVisible();
    await expect(constructor.getByText('Выберите булки')).toBeHidden();
    await expect(constructor.getByText('Выберите начинку')).toBeHidden();

    for (const main of mains) {
      await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    }
  });
});

test.describe('модальное окно с описанием ингредиента', () => {
  test('открывает окно с данными выбранного ингредиента и закрывает по крестику', async ({
    page,
  }) => {
    const modal = getModal(page);

    await expect(modal).toHaveCount(0);

    await page.locator(`a[href="/ingredients/${sauce._id}"]`).click();

    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(sauce.name, { exact: true })).toBeVisible();
    await expect(modal.getByText(String(sauce.calories), { exact: true })).toBeVisible();
    await expect(modal.getByText(String(sauce.proteins), { exact: true })).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
    await expect(page).toHaveURL('/');
  });

  test('закрывает окно ингредиента по оверлею', async ({ page }) => {
    const modal = getModal(page);

    await expect(modal).toHaveCount(0);

    await page.locator(`a[href="/ingredients/${sauce._id}"]`).click();
    await expect(modal).toBeVisible();

    await page.getByTestId('overlay').click({ position: { x: 5, y: 5 } });

    await expect(modal).toBeHidden();
  });
});

test.describe('оформление заказа', () => {
  test('создаёт заказ, показывает номер и очищает конструктор', async ({ page }) => {
    const constructor = getConstructor(page);
    const modal = getModal(page);
    const main = mains[0];

    await expect(constructor.getByText(bun.name, { exact: true })).toHaveCount(0);
    await addIngredient(page, bun.name);

    await expect(constructor.getByText(main.name, { exact: true })).toHaveCount(0);
    await addIngredient(page, main.name);

    await expect(constructor.getByText(`${bun.name} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${bun.name} (низ)`)).toBeVisible();
    await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    await expect(modal).toHaveCount(0);

    await constructor.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(modal).toBeVisible();
    await expect(modal.getByText(String(ORDER_NUMBER), { exact: true })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
  });
});
