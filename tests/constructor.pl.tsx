import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { BrowserContext, Page } from '@playwright/test';
import type { TIngredient } from '../src/utils/types';

const HAR_PATH = join(process.cwd(), 'tests', 'hars', 'burger-api.har');
const ORDER_NUMBER = 123456;

type THarEntry = {
  request: { method: string; url: string };
  response: { content: { text: string } };
};

const getMockIngredients = (): TIngredient[] => {
  const har = JSON.parse(readFileSync(HAR_PATH, 'utf8')) as {
    log: { entries: THarEntry[] };
  };
  const entry = har.log.entries.find(
    (item) =>
      item.request.method === 'GET' && item.request.url.endsWith('/api/ingredients')
  );

  if (!entry) {
    throw new Error('В HAR не найден ответ для /api/ingredients');
  }

  const body = JSON.parse(entry.response.content.text) as {
    success: boolean;
    data: TIngredient[];
  };

  return body.data;
};

const getConstructor = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });

const getModal = (page: Page) => page.locator('[class*="modal__modal"]');

const getIngredient = (type: string): TIngredient => {
  const ingredient = getMockIngredients().find((item) => item.type === type);

  if (!ingredient) {
    throw new Error(`В моках нет ингредиента типа ${type}`);
  }

  return ingredient;
};

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

test.describe('добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page, context }) => {
    await preparePage(page, context);
  });

  test('добавляет один ингредиент в конструктор', async ({ page }) => {
    const main = getIngredient('main');
    const constructor = getConstructor(page);

    await addIngredient(page, main.name);

    await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeHidden();
  });

  test('добавляет булку и начинки в конструктор', async ({ page }) => {
    const ingredients = getMockIngredients();
    const bun = getIngredient('bun');
    const mains = ingredients.filter((item) => item.type === 'main');
    const constructor = getConstructor(page);

    await addIngredient(page, bun.name);

    for (const main of mains) {
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
  test.beforeEach(async ({ page, context }) => {
    await preparePage(page, context);
  });

  test('открывает окно с данными выбранного ингредиента и закрывает по крестику', async ({
    page,
  }) => {
    const ingredient = getIngredient('sauce');
    const modal = getModal(page);

    await page.locator(`a[href="/ingredients/${ingredient._id}"]`).click();

    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(ingredient.name, { exact: true })).toBeVisible();
    await expect(
      modal.getByText(String(ingredient.calories), { exact: true })
    ).toBeVisible();
    await expect(
      modal.getByText(String(ingredient.proteins), { exact: true })
    ).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
    await expect(page).toHaveURL('/');
  });

  test('закрывает окно ингредиента по оверлею', async ({ page }) => {
    const ingredient = getIngredient('sauce');
    const modal = getModal(page);

    await page.locator(`a[href="/ingredients/${ingredient._id}"]`).click();
    await expect(modal).toBeVisible();

    await page
      .locator('[class*="modal-overlay__overlay"]')
      .click({ position: { x: 5, y: 5 } });

    await expect(modal).toBeHidden();
  });
});

test.describe('оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await preparePage(page, context);
  });

  test('создаёт заказ, показывает номер и очищает конструктор', async ({ page }) => {
    const bun = getIngredient('bun');
    const main = getIngredient('main');
    const constructor = getConstructor(page);

    await addIngredient(page, bun.name);
    await addIngredient(page, main.name);

    const orderRequest = page.waitForRequest(
      (request) => request.url().includes('/api/orders') && request.method() === 'POST'
    );

    await constructor.getByRole('button', { name: 'Оформить заказ' }).click();

    const request = await orderRequest;
    const body = request.postDataJSON() as { ingredients: string[] };

    expect(body.ingredients).toEqual([bun._id, main._id, bun._id]);
    await expect(page.getByText('Оформляем заказ...')).toBeHidden();

    const modal = getModal(page);

    await expect(modal.getByText(String(ORDER_NUMBER), { exact: true })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
  });
});
