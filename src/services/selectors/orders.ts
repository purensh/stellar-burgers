import type { RootState } from '@services/store';
import type { TOrder } from '@utils-types';

export const selectOrders = (state: RootState): TOrder[] => state.userOrders.orders;

export const selectOrderData = (state: RootState): TOrder | null =>
  state.orderDetails.orderData;

export const selectOrderRequest = (state: RootState): boolean =>
  state.order.orderRequest;

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.order.orderModalData;

export const selectOrdersLoading = (state: RootState): boolean =>
  state.userOrders.isOrdersLoading;

export const selectOrderDataLoading = (state: RootState): boolean =>
  state.orderDetails.isOrderDataLoading;

export const selectOrderDetailsError = (state: RootState): string | null =>
  state.orderDetails.error;
