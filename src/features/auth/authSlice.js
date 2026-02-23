import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/identityService';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password, twoFactorCode }, { rejectWithValue }) => {
    try {
      const payload = { email, password };
      if (twoFactorCode) payload.twoFactorCode = twoFactorCode;
      const res = await authAPI.login(payload);
      const { accessToken, refreshToken, user } = res.data.data;
      return { accessToken, refreshToken, user };
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || 'auth.errors.invalidCredentials';
      return rejectWithValue({ message: msg });
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const res = await authAPI.register({ email, password, role });
      return { email: res.data.data.email, role: res.data.data.role };
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || 'auth.errors.emailTaken';
      return rejectWithValue({ message: msg });
    }
  }
);

// Named refreshAccessToken so axiosInstances.js can import it correctly
export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      if (!refreshToken) throw new Error('No refresh token');
      const res = await authAPI.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = res.data.data;
      return { accessToken, refreshToken: newRefreshToken };
    } catch (e) {
      return rejectWithValue({ message: e.message });
    }
  }
);

// ─── Persist helpers ──────────────────────────────────────────────────────────
const load = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

const persist = (user, access, refresh) => {
  localStorage.setItem('cm360_user',          JSON.stringify(user));
  localStorage.setItem('cm360_access_token',  access);
  localStorage.setItem('cm360_refresh_token', refresh);
};

const clear = () => {
  localStorage.removeItem('cm360_user');
  localStorage.removeItem('cm360_access_token');
  localStorage.removeItem('cm360_refresh_token');
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            load('cm360_user'),
    accessToken:     localStorage.getItem('cm360_access_token'),
    refreshToken:    localStorage.getItem('cm360_refresh_token'),
    loading:         false,
    error:           null,
    registered:      false,
    registeredEmail: null,
  },
  reducers: {
    logout(state) {
      state.user         = null;
      state.accessToken  = null;
      state.refreshToken = null;
      clear();
    },
    clearError(state) {
      state.error = null;
    },
    clearRegistered(state) {
      state.registered      = false;
      state.registeredEmail = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginThunk.fulfilled, (s, { payload }) => {
        s.loading      = false;
        s.user         = payload.user;
        s.accessToken  = payload.accessToken;
        s.refreshToken = payload.refreshToken;
        persist(payload.user, payload.accessToken, payload.refreshToken);
      })
      .addCase(loginThunk.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload?.message || 'auth.errors.invalidCredentials';
      });

    // Register
    builder
      .addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerThunk.fulfilled, (s, { payload }) => {
        s.loading         = false;
        s.registered      = true;
        s.registeredEmail = payload.email;
      })
      .addCase(registerThunk.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload?.message || 'auth.errors.emailTaken';
      });

    // Refresh
    builder
      .addCase(refreshAccessToken.fulfilled, (s, { payload }) => {
        s.accessToken  = payload.accessToken;
        s.refreshToken = payload.refreshToken;
        localStorage.setItem('cm360_access_token',  payload.accessToken);
        localStorage.setItem('cm360_refresh_token', payload.refreshToken);
      })
      .addCase(refreshAccessToken.rejected, (s) => {
        s.user = null; s.accessToken = null; s.refreshToken = null;
        clear();
      });
  },
});

export const { logout, clearError, clearRegistered } = authSlice.actions;
export default authSlice.reducer;
