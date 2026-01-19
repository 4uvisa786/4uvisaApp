import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { showSnackbar } from './snackbarSlice';

export const fetchStats = createAsyncThunk(
  'admin/get-stats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load statistics';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      console.error('Error fetching admin stats:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllRequests = createAsyncThunk(
  'admin/get-all-requests',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/requests/get-requests');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load requests';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      console.error('Error fetching admin all requests:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'admin/update-request-status',
  async ({ requestId, statusData }, { dispatch, rejectWithValue }) => {
    console.log('Updating request status for ID:', requestId, 'with data:', statusData);
    try {
      const response = await axiosInstance.put(
        `/requests/update-request-status/${requestId}`,
        statusData,
      );
      
      // Show success message based on status
      const statusMessages = {
        pending: 'Request marked as pending',
        processing: 'Request is now being processed',
        completed: 'Request completed successfully!',
        rejected: 'Request has been rejected',
        cancelled: 'Request has been cancelled',
      };
      
      const successMessage = statusMessages[statusData.newStatus] || 
                            'Request status updated successfully!';
      
      dispatch(showSnackbar({
        message: successMessage,
        type: statusData.newStatus === 'rejected' ? 'warning' : 'success',
        duration: 3000,
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to update request status';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getMyRequests = createAsyncThunk(
  'admin/get-my-requests',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/requests/get-my-requests');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load your requests';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/get-all-users',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/users');
      return response.data;
    }
    catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load users';
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllAirTickets = createAsyncThunk(
  'admin/get-all-air-bookings',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/air-bookings/all-air-bookings');
      return response.data;
    }
    catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load air tickets';
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAirBookingStatus = createAsyncThunk(
  'admin/update-air-booking-status',
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/air-bookings/change-status/${id}`,
        { status }
      );
      dispatch(showSnackbar({
        message: 'Air booking status updated successfully!',
        type: 'success',
        duration: 3000,
      }));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to update air booking status';
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    requests: [],
    myRequests: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAllRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateRequestStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRequest = action.payload?.request || action.payload;
        
        if (updatedRequest && updatedRequest._id) {
          const index = state.requests.findIndex(
            req => req._id === updatedRequest._id
          );
          
          if (index !== -1) {
            state.requests[index] = updatedRequest;
          } else {
            state.requests.push(updatedRequest);
          }
        }
        
        state.error = null;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Something went wrong';
      })
      .addCase(getMyRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload?.data || [];
        state.error = null;
      })
      .addCase(getMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchAllUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAllAirTickets.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAirTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.airTickets = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllAirTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateAirBookingStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAirBookingStatus.fulfilled, (state, action) => {
  state.loading = false;

  const updatedBooking = action.payload?.data;

  if (updatedBooking?._id) {
    const index = state.airTickets.findIndex(
      booking => booking._id === updatedBooking._id
    );

    if (index !== -1) {
      state.airTickets[index] = updatedBooking;
    }
  }

  state.error = null;
})
      .addCase(updateAirBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Something went wrong';
      });
  },
});

export default adminSlice.reducer;
