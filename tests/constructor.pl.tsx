import { expect, test } from '@playwright/test';

import type { BrowserContext, Page } from '@playwright/test';
import type { TIngredient } from '../src/utils/types';

const HAR_PATH = './tests/hars/burger-api.har';
const ORDER_NUMBER = 123456;

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 20,
  fat: 15,
  carbohydrates: 30,
  calories: 250,
  price: 1255,
  image: '',
  image_large: '',
  image_mobile: '',
};

const sauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 5,
  fat: 10,
  carbohydrates: 15,
  calories: 100,
  price: 90,
  image: '',
  image_large: '',
  image_mobile: '',
};

const mains: TIngredient[] = [
  {
    _id: 'main-1',
    name: 'Говяжий метеорит (отбивная)',
    type: 'main',
    proteins: 40,
    fat: 30,
    carbohydrates: 10,
    calories: 450,
    price: 800,
    image: '',
    image_large: '',
    image_mobile: '',
  },
  {
    _id: 'main-2',
    name: 'Биокотлета из марли',
    type: 'main',
    proteins: 25,
    fat: 15,
    carbohydrates: 20,
    calories: 300,
    price: 424,
    image: '',
    image_large: '',
    image_mobile: '',
  },
];

const getConstructor = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });

const getModal = (page: Page) => page.locator('[class*="modal__modal"]');

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
    const main = mains[0];
    const constructor = getConstructor(page);

    await addIngredient(page, main.name);

    await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeHidden();
  });

  test('добавляет булку и начинки в конструктор', async ({ page }) => {
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
    const modal = getModal(page);

    await page.locator(`a[href="/ingredients/${sauce._id}"]`).click();

    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(sauce.name, { exact: true })).toBeVisible();
    await expect(modal.getByText(String(sauce.calories), { exact: true })).toBeVisible();
    await expect(modal.getByText(String(sauce.proteins), { exact: true })).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
    await expect(page).toHaveURL('/');
  });

  test('закрывает окно ингредиента по оверлею', async ({ page }) => {
    const modal = getModal(page);

    await page.locator(`a[href="/ingredients/${sauce._id}"]`).click();
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
    const constructor = getConstructor(page);
    const main = mains[0];

    await addIngredient(page, bun.name);
    await addIngredient(page, main.name);

    await constructor.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.getByText('Оформляем заказ...')).toBeHidden();

    const modal = getModal(page);

    await expect(modal).toBeVisible();
    await expect(modal.getByText(String(ORDER_NUMBER), { exact: true })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeHidden();
  });
});
