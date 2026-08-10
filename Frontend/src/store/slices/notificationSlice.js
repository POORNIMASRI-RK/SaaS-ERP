import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/notifications');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch notifications');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error loading notifications'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const target = state.list.find((n) => n._id === notificationId);
      if (target && !target.isRead) {
        target.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { markAsRead, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
