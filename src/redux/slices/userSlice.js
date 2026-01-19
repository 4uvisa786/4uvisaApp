import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { showSnackbar } from './snackbarSlice';
import { Alert } from 'react-native';

export const myRequests = createAsyncThunk(
  'user/my-requests',
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/requests/get-my-requests`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load your requests';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createRequest = createAsyncThunk(
  'user/create-request',
  async (requestData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/requests/create-request',
        requestData,
      );

       // Show success snackbar
      dispatch(showSnackbar({
        message: 'Request submitted successfully!',
        type: 'success',
        duration: 3000,
      }));

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to submit request. Please try again.';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      // console.error('Error creating request:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// 📌 FETCH NOTIFICATIONS (with pagination)
export const fetchNotifications = createAsyncThunk(
  'user/fetch-notifications',
  async ({ page = 1, limit = 10 }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/notifications/get-notifications?page=${page}&limit=${limit}`
      );
      console.log('Fetched Notifications:', response.data);
      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Failed to load notifications';

      dispatch(showSnackbar({
        message: errMsg,
        type: 'error',
        duration: 4000,
      }));
      console.error('Error fetching notifications:', errMsg);

      return rejectWithValue(errMsg);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'user/clear-all-notifications',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        '/notifications/clear-all'
      );

      // Show success snackbar
      dispatch(showSnackbar({
        message: 'All notifications cleared successfully!',
        type: 'success',
        duration: 3000,
      }));

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to clear notifications. Please try again.';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    myRequests: [],
    loading: false,
    error: null,
     notifications: [],
  notifPage: 1,
  notifTotalPages: 1,
  notifTotal: 0,
  notifLoading: false,
  },
  extraReducers: builder => {
    builder
      .addCase(myRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(myRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.data;
        state.error = null;
      })
      .addCase(myRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests.push(action.payload.data);
        state.error = null;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
       // 🔔 FETCH NOTIFICATIONS
  .addCase(fetchNotifications.pending, state => {
    state.notifLoading = true;
    state.error = null;
  })
  .addCase(fetchNotifications.fulfilled, (state, action) => {
    state.notifLoading = false;

    // Overwrite list (OR append for infinite scroll)
    state.notifications =
      action.payload.page === 1
        ? action.payload.data
        : [...state.notifications, ...action.payload.data];

    state.notifPage = action.payload.page;
    state.notifTotalPages = action.payload.totalPages;
    state.notifTotal = action.payload.total;

    state.error = null;
  })
  .addCase(fetchNotifications.rejected, (state, action) => {
    state.notifLoading = false;
    state.error = action.payload;
  })
  .addCase(clearAllNotifications.fulfilled, state => {
    state.notifications = [];
    state.notifPage = 1;
    state.notifTotalPages = 1;
    state.notifTotal = 0;
  });
  },
});

export default userSlice.reducer;
