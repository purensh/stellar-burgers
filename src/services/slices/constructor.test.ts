import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './constructor';
import { bun, mains } from './mocks';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const firstMain = mains[0];
const secondMain = mains[1];

const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

const firstIngredient = withId(firstMain, 'id-1');
const secondIngredient = withId(secondMain, 'id-2');
const thirdIngredient = withId(
  { ...firstMain, _id: 'main-3', name: 'Третья начинка' },
  'id-3'
);

const filledConstructor: TConstructorState = {
  bun: withId(bun, 'bun-id'),
  ingredients: [firstIngredient, secondIngredient],
};

const constructorWithThreeMains: TConstructorState = {
  bun: null,
  ingredients: [firstIngredient, secondIngredient, thirdIngredient],
};

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
    const state = constructorReducer(
      constructorWithThreeMains,
      removeIngredient('id-2')
    );

    expect(state.ingredients).toEqual([firstIngredient, thirdIngredient]);
  });

  it('перемещает начинку через moveIngredient', () => {
    const state = constructorReducer(
      constructorWithThreeMains,
      moveIngredient({ from: 0, to: 2 })
    );

    expect(state.ingredients).toEqual([
      secondIngredient,
      thirdIngredient,
      firstIngredient,
    ]);
  });

  it('не меняет состояние при невалидном moveIngredient', () => {
    expect(
      constructorReducer(filledConstructor, moveIngredient({ from: 0, to: 0 }))
    ).toEqual(filledConstructor);
    expect(
      constructorReducer(filledConstructor, moveIngredient({ from: 0, to: 5 }))
    ).toEqual(filledConstructor);
  });

  it('очищает конструктор через clearConstructor', () => {
    expect(constructorReducer(filledConstructor, clearConstructor())).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});
