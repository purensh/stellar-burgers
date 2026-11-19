import { fetchIngredients, ingredientsReducer } from './ingredients';

import type { TIngredient } from '@utils-types';

const ingredient: TIngredient = {
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

describe('ingredientsReducer', () => {
  it('возвращает начальное состояние для неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  it('обрабатывает pending у fetchIngredients', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.pending('request-id', undefined)
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  it('обрабатывает fulfilled у fetchIngredients', () => {
    const payload = [ingredient];

    const state = ingredientsReducer(
      undefined,
      fetchIngredients.fulfilled(payload, 'request-id', undefined)
    );

    expect(state).toEqual({
      ingredients: payload,
      isLoading: false,
      error: null,
    });
  });

  it('обрабатывает rejected у fetchIngredients', () => {
    const state = ingredientsReducer(
      undefined,
      fetchIngredients.rejected(
        new Error('Не удалось загрузить'),
        'request-id',
        undefined
      )
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Не удалось загрузить',
    });
  });

  it('сбрасывает ошибку при новом pending', () => {
    const withError = ingredientsReducer(
      undefined,
      fetchIngredients.rejected(new Error('Прошлая ошибка'), 'request-id', undefined)
    );

    const state = ingredientsReducer(
      withError,
      fetchIngredients.pending('new-request-id', undefined)
    );

    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(true);
  });
});
