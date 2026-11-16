import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructor';
import { feedReducer } from './slices/feed';
import { ingredientsReducer } from './slices/ingredients';
import { ordersReducer } from './slices/orders';
import { userReducer } from './slices/user';

// TODO: Заменить на настоящий корневой редьюсер
export const rootReducer = combineReducers({
  // TODO: Собрать здесь редьюсеры слайсов
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  orders: ordersReducer,
  user: userReducer,
});
