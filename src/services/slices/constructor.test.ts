import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './constructor';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

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

const firstMain: TIngredient = {
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
};

const secondMain: TIngredient = {
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
};

const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

describe('constructorReducer', () => {
  it('возвращает начальное состояние для неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  it('добавляет булку через addIngredient', () => {
    const state = constructorReducer(undefined, addIngredient(bun));

    expect(state.bun).toMatchObject(bun);
    expect(typeof state.bun?.id).toBe('string');
    expect(state.ingredients).toEqual([]);
  });

  it('добавляет начинку через addIngredient', () => {
    const state = constructorReducer(undefined, addIngredient(firstMain));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject(firstMain);
    expect(typeof state.ingredients[0]?.id).toBe('string');
  });

  it('удаляет начинку через removeIngredient', () => {
    const first = withId(firstMain, 'id-1');
    const second = withId(secondMain, 'id-2');
    const previous: TConstructorState = {
      bun: null,
      ingredients: [first, second],
    };

    const state = constructorReducer(previous, removeIngredient('id-1'));

    expect(state.ingredients).toEqual([second]);
  });

  it('перемещает начинку через moveIngredient', () => {
    const first = withId(firstMain, 'id-1');
    const second = withId(secondMain, 'id-2');
    const previous: TConstructorState = {
      bun: null,
      ingredients: [first, second],
    };

    const state = constructorReducer(previous, moveIngredient({ from: 0, to: 1 }));

    expect(state.ingredients).toEqual([second, first]);
  });

  it('не меняет состояние при невалидном moveIngredient', () => {
    const first = withId(firstMain, 'id-1');
    const second = withId(secondMain, 'id-2');
    const previous: TConstructorState = {
      bun: null,
      ingredients: [first, second],
    };

    expect(constructorReducer(previous, moveIngredient({ from: 0, to: 0 }))).toEqual(
      previous
    );
    expect(constructorReducer(previous, moveIngredient({ from: 0, to: 5 }))).toEqual(
      previous
    );
  });

  it('очищает конструктор через clearConstructor', () => {
    const previous: TConstructorState = {
      bun: withId(bun, 'bun-id'),
      ingredients: [withId(firstMain, 'id-1'), withId(secondMain, 'id-2')],
    };

    expect(constructorReducer(previous, clearConstructor())).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});
