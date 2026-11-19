import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructor';
import { feedReducer } from './slices/feed';
import { ingredientsReducer } from './slices/ingredients';
import { orderDetailsReducer, orderReducer, userOrdersReducer } from './slices/orders';
import { userReducer } from './slices/user';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  order: orderReducer,
  userOrders: userOrdersReducer,
  orderDetails: orderDetailsReducer,
  user: userReducer,
});
