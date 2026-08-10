import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchInventoryItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/manufacturing/inventory/items');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch inventory items');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching inventory'
      );
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    totalValuation: 0,
    lowStockCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setItemList: (state, action) => {
      state.items = action.payload;
      state.totalValuation = action.payload.reduce(
        (sum, item) => sum + (item.unitPrice || 0) * (item.totalStock || 0),
        0
      );
      state.lowStockCount = action.payload.filter(
        (item) => (item.totalStock || 0) <= (item.minStockLevel || 10)
      ).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.totalValuation = action.payload.reduce(
          (sum, item) => sum + (item.unitPrice || 0) * (item.totalStock || 0),
          0
        );
        state.lowStockCount = action.payload.filter(
          (item) => (item.totalStock || 0) <= (item.minStockLevel || 10)
        ).length;
        state.loading = false;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setItemList } = inventorySlice.actions;
export default inventorySlice.reducer;
