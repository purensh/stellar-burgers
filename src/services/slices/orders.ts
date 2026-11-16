import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrdersState = {
  orders: TOrder[];
  orderData: TOrder | null;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  isOrdersLoading: boolean;
  isOrderDataLoading: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  orders: [],
  orderData: null,
  orderRequest: false,
  orderModalData: null,
  isOrdersLoading: false,
  isOrderDataLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk<TOrder, string[]>(
  'orders/createOrder',
  async (ingredients) => {
    const data = await orderBurgerApi(ingredients);

    if (!data.success) {
      throw new Error('Не удалось оформить заказ');
    }

    return data.order;
  }
);

export const getOrders = createAsyncThunk<TOrder[]>('orders/getOrders', async () =>
  getOrdersApi()
);

export const getOrderByNumber = createAsyncThunk<TOrder, number>(
  'orders/getOrderByNumber',
  async (number) => {
    const data = await getOrderByNumberApi(number);

    if (!data.success) {
      throw new Error('Не удалось загрузить заказ');
    }

    const order = data.orders[0];

    if (!order) {
      throw new Error('Заказ не найден');
    }

    return order;
  }
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderModal: (state) => {
      state.orderModalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(getOrders.pending, (state) => {
        state.isOrdersLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isOrdersLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isOrdersLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказы';
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isOrderDataLoading = true;
        state.orderData = null;
        state.error = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isOrderDataLoading = false;
        state.orderData = action.payload;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.isOrderDataLoading = false;
        state.orderData = null;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
      });
  },
});

export const { clearOrderModal } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
