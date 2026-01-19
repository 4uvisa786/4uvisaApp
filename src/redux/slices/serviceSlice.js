import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { showSnackbar } from './snackbarSlice';

export const fetchServices = createAsyncThunk(
  'service/get-service',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/services/get-services');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load services';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createService = createAsyncThunk(
  'service/create-service',
  async (serviceData, { dispatch, rejectWithValue }) => {
    try {
      console.log('Creating service with data:', serviceData);
      const response = await axiosInstance.post(
        '/services/create-service',
        serviceData,
      );
      
      dispatch(showSnackbar({
        message: 'Service created successfully!',
        type: 'success',
        duration: 3000,
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to create service';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      console.error('Error creating service:', error);
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateService = createAsyncThunk(
  'service/update-service',
  async (serviceData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/services/update-service/${serviceData.id}`,
        serviceData,
      );
      
      dispatch(showSnackbar({
        message: 'Service updated successfully!',
        type: 'success',
        duration: 3000,
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to update service';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteService = createAsyncThunk(
  'service/delete-service',
  async (serviceId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/services/delete-service/${serviceId}`,
      );
      
      dispatch(showSnackbar({
        message: 'Service deleted successfully!',
        type: 'success',
        duration: 3000,
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to delete service';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  },
);

export const toggleServiceStatus = createAsyncThunk(
  'service/toggle-service-status',
  async ({ serviceId, status }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/services/toggle-status/${serviceId}`,
        { status },
      );
      
      const statusText = status ? 'activated' : 'deactivated';
      dispatch(showSnackbar({
        message: `Service ${statusText} successfully!`,
        type: 'success',
        duration: 3000,
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to update service status';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchServiceById = createAsyncThunk(
  'user/get-service-by-id',
  async (serviceId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/services/get-service/${serviceId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to load service details';
      
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllRequests = createAsyncThunk(
  'service/get-all-requests',
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
      
      return rejectWithValue(errorMessage);
    }
  },
);

const serviceSlice = createSlice({
  name: 'service',
  initialState: {
    services: [],
    serviceById: null,
    requests: [],
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchServices.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload.data);
        state.error = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(
          service => service._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.services[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(
          service => service._id !== action.payload.data._id,
        );
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(toggleServiceStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(
          service => service._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.services[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchServiceById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceById = action.payload.data;
        state.error = null;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
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
      });
  },
});

export default serviceSlice.reducer;
