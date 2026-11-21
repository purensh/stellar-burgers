import type { TIngredient } from '../../utils/types';

export const bun: TIngredient = {
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

export const sauce: TIngredient = {
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

export const mains: TIngredient[] = [
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
