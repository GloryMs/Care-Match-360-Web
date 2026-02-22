import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ─── Mock API (replace with real axios calls once backend is running) ──────────
const mockDelay = (ms = 800) => new Promise(r => setTimeout(r, ms));

const MOCK_USERS = {
  'patient@test.com':  { id: 'u1', email: 'patient@test.com',  role: 'PATIENT',               isVerified: true,  isActive: true, twoFactorEnabled: false },
  'relative@test.com': { id: 'u2', email: 'relative@test.com', role: 'RELATIVE',               isVerified: true,  isActive: true, twoFactorEnabled: false },
  'res@test.com':      { id: 'u3', email: 'res@test.com',       role: 'RESIDENTIAL_PROVIDER',  isVerified: true,  isActive: true, twoFactorEnabled: false },
  'amb@test.com':      { id: 'u4', email: 'amb@test.com',       role: 'AMBULATORY_PROVIDER',   isVerified: true,  isActive: true, twoFactorEnabled: false },
  'admin@test.com':    { id: 'u5', email: 'admin@test.com',     role: 'ADMIN',                 isVerified: true,  isActive: true, twoFactorEnabled: false },
  'super@test.com':    { id: 'u6', email: 'super@test.com',     role: 'SUPER_ADMIN',           isVerified: true,  isActive: true, twoFactorEnabled: false },
};

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    await mockDelay();
    const user = MOCK_USERS[email];
    if (!user || password.length < 4) {
      return rejectWithValue({ message: 'auth.errors.invalidCredentials' });
    }
    return {
      accessToken:  'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user,
    };
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password, role }, { rejectWithValue }) => {
    await mockDelay();
    if (MOCK_USERS[email]) {
      return rejectWithValue({ message: 'auth.errors.emailTaken' });
    }
    // In real app: call POST /auth/register
    return { email, role };
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      await mockDelay(200);
      const { refreshToken } = getState().auth;
      if (!refreshToken) throw new Error('No refresh token');
      return { accessToken: 'mock-access-token-' + Date.now(), refreshToken };
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
    user:         load('cm360_user'),
    accessToken:  load('cm360_access_token', null) ?? localStorage.getItem('cm360_access_token'),
    refreshToken: localStorage.getItem('cm360_refresh_token'),
    loading:      false,
    error:        null,
    registered:   false,   // flag: show verify-email screen
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
      .addCase(refreshTokenThunk.fulfilled, (s, { payload }) => {
        s.accessToken  = payload.accessToken;
        s.refreshToken = payload.refreshToken;
        localStorage.setItem('cm360_access_token',  payload.accessToken);
        localStorage.setItem('cm360_refresh_token', payload.refreshToken);
      })
      .addCase(refreshTokenThunk.rejected, (s) => {
        s.user = null; s.accessToken = null; s.refreshToken = null;
        clear();
      });
  },
});

export const { logout, clearError, clearRegistered } = authSlice.actions;
export default authSlice.reducer;