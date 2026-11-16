import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TFeedState } from '@utils-types';

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

type TFeedResponse = Pick<TFeedState, 'orders' | 'total' | 'totalToday'>;

export const fetchFeeds = createAsyncThunk<TFeedResponse>(
  'feed/fetchFeeds',
  async () => {
    const data = await getFeedsApi();

    if (!data.success) {
      throw new Error('Не удалось загрузить ленту заказов');
    }

    return {
      orders: data.orders,
      total: data.total,
      totalToday: data.totalToday,
    };
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ленту заказов';
      });
  },
});

export const feedReducer = feedSlice.reducer;
