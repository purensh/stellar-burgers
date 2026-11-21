import { fetchIngredients, ingredientsReducer } from './ingredients';
import { bun } from './mocks';

describe('ingredientsReducer', () => {
  it('возвращает начальное состояние для неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  it('обрабатывает pending у fetchIngredients', () => {
    const stateWithError = {
      ingredients: [],
      isLoading: false,
      error: 'Прошлая ошибка',
    };

    const state = ingredientsReducer(
      stateWithError,
      fetchIngredients.pending('request-id', undefined)
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  it('обрабатывает fulfilled у fetchIngredients', () => {
    const payload = [bun];

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
});
