import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  isUpdatingUser: boolean;
  error: string | null;
  updateUserError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  isUpdatingUser: false,
  error: null,
  updateUserError: null,
};

const saveTokens = (refreshToken: string, accessToken: string): void => {
  localStorage.setItem('refreshToken', refreshToken);
  setCookie('accessToken', accessToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
};

export const getUser = createAsyncThunk<TUser | null>('user/getUser', async () => {
  if (!localStorage.getItem('refreshToken')) {
    return null;
  }

  const data = await getUserApi();

  if (!data.success) {
    throw new Error('Не удалось получить данные пользователя');
  }

  return data.user;
});

export const loginUser = createAsyncThunk<TUser, TLoginData>(
  'user/loginUser',
  async (data) => {
    const response = await loginUserApi(data);

    if (!response.success) {
      throw new Error('Не удалось войти');
    }

    saveTokens(response.refreshToken, response.accessToken);

    return response.user;
  }
);

export const registerUser = createAsyncThunk<TUser, TRegisterData>(
  'user/registerUser',
  async (data) => {
    const response = await registerUserApi(data);

    if (!response.success) {
      throw new Error('Не удалось зарегистрироваться');
    }

    saveTokens(response.refreshToken, response.accessToken);

    return response.user;
  }
);

export const updateUser = createAsyncThunk<TUser, Partial<TRegisterData>>(
  'user/updateUser',
  async (data) => {
    const response = await updateUserApi(data);

    if (!response.success) {
      throw new Error('Не удалось обновить данные пользователя');
    }

    return response.user;
  }
);

export const requestPasswordReset = createAsyncThunk<void, { email: string }>(
  'user/requestPasswordReset',
  async ({ email }) => {
    const response = await forgotPasswordApi({ email });

    if (!response.success) {
      throw new Error('Не удалось отправить письмо для восстановления пароля');
    }
  }
);

export const confirmPasswordReset = createAsyncThunk<
  void,
  { password: string; token: string }
>('user/confirmPasswordReset', async (data) => {
  const response = await resetPasswordApi(data);

  if (!response.success) {
    throw new Error('Не удалось изменить пароль');
  }
});

export const logoutUser = createAsyncThunk<void>('user/logoutUser', async () => {
  await logoutApi().catch(() => undefined);
  clearTokens();
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUpdateUserError: (state) => {
      state.updateUserError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = action.error.message ?? 'Не удалось проверить авторизацию';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = action.error.message ?? 'Не удалось войти';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = action.error.message ?? 'Не удалось зарегистрироваться';
      })
      .addCase(updateUser.pending, (state) => {
        state.isUpdatingUser = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdatingUser = false;
        state.user = action.payload;
        state.updateUserError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdatingUser = false;
        state.updateUserError =
          action.error.message ?? 'Не удалось обновить данные пользователя';
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = action.error.message ?? 'Не удалось выйти';
      });
  },
});

export const { clearUserError, clearUpdateUserError } = userSlice.actions;
export const userReducer = userSlice.reducer;
