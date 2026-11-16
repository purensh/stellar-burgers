import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectOrders = (state: RootState): TOrder[] => state.orders.orders;

export const selectOrderData = (state: RootState): TOrder | null =>
  state.orders.orderData;

export const selectOrderRequest = (state: RootState): boolean =>
  state.orders.orderRequest;

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.orders.orderModalData;

export const selectOrdersLoading = (state: RootState): boolean =>
  state.orders.isOrdersLoading;

export const selectOrderDataLoading = (state: RootState): boolean =>
  state.orders.isOrderDataLoading;

export const selectOrdersError = (state: RootState): string | null => state.orders.error;
