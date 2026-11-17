import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const orderInitialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null,
};

export const createOrder = createAsyncThunk<TOrder, string[]>(
  'order/createOrder',
  async (ingredients) => {
    const data = await orderBurgerApi(ingredients);

    if (!data.success) {
      throw new Error('Не удалось оформить заказ');
    }

    return data.order;
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState: orderInitialState,
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
      });
  },
});

type TUserOrdersState = {
  orders: TOrder[];
  isOrdersLoading: boolean;
  error: string | null;
};

const userOrdersInitialState: TUserOrdersState = {
  orders: [],
  isOrdersLoading: false,
  error: null,
};

export const getOrders = createAsyncThunk<TOrder[]>('userOrders/getOrders', async () =>
  getOrdersApi()
);

export const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState: userOrdersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

type TOrderDetailsState = {
  orderData: TOrder | null;
  isOrderDataLoading: boolean;
  error: string | null;
};

const orderDetailsInitialState: TOrderDetailsState = {
  orderData: null,
  isOrderDataLoading: false,
  error: null,
};

export const getOrderByNumber = createAsyncThunk<TOrder, number>(
  'orderDetails/getOrderByNumber',
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

export const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState: orderDetailsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

export const { clearOrderModal } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
export const userOrdersReducer = userOrdersSlice.reducer;
export const orderDetailsReducer = orderDetailsSlice.reducer;
