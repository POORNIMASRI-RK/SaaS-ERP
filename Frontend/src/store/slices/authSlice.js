import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Async Thunk: Fetch Current Logged-in User
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        return response.data.user;
      }
      return rejectWithValue('Failed to fetch user data');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Session expired or network error'
      );
    }
  }
);

const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token') || null;
let storedUser = null;
try {
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (rawUser) {
    storedUser = JSON.parse(rawUser);
  }
} catch (e) {
  storedUser = null;
}

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, rememberMe } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      });
  },
});

export const { setCredentials, updateUser, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
