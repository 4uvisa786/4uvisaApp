import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSnackbar } from './snackbarSlice';

/* -------------------------- Helpers -------------------------- */

const saveAuthData = async (user, token) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
  } catch (err) {
    console.log('AsyncStorage save error:', err);
  }
};

const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  } catch (err) {
    console.log('AsyncStorage clear error:', err);
  }
};

/* -------------------------- Thunks -------------------------- */

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/register', userData);
      const user = data?.data?.user;
      const token = data?.data?.token;

      await saveAuthData(user, token);

      // Show success snackbar
      dispatch(
        showSnackbar({
          message: 'Registration successful! Welcome aboard.',
          type: 'success',
          duration: 3000,
        }),
      );

      return { user, token };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';

      // Show error snackbar
      dispatch(
        showSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        }),
      );

      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', {
        username,
        password,
      });

      const user = data?.data?.user;
      const token = data?.data?.token;

      await saveAuthData(user, token);

      // Show success snackbar
      dispatch(
        showSnackbar({
          message: `Welcome back, ${user?.firstName || 'User'}!`,
          type: 'success',
          duration: 3000,
        }),
      );

      return { user, token };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.';

      // Show error snackbar
      dispatch(
        showSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        }),
      );

      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { dispatch, rejectWithValue }) => {
    console.log('changePassword thunk called');
    console.log('Old Password:', oldPassword, newPassword);
    try {
      const response = await axiosInstance.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      console.log('Password change response:', response?.data?.message);

      return response?.data?.message || 'Password changed successfully.';
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Password change failed';

      return rejectWithValue(errorMessage);
    }
  },
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');

      if (!user || !token) return null;

      return {
        user: JSON.parse(user),
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updatedData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put('/auth/update-profile', updatedData);

      // Save to async storage
      await AsyncStorage.setItem('user', JSON.stringify(data.data));

      dispatch(
        showSnackbar({
          message: "Profile updated successfully!",
          type: "success",
        })
      );

      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile";

      dispatch(showSnackbar({ message: msg, type: "error" }));

      return rejectWithValue(msg);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { dispatch, rejectWithValue }) => {
    try {
      const {data} = await axiosInstance.post('/auth/forgot-password', { email });
      return {success: data.success, email: data.email, otp: data.otp, message:data.message}
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to initiate password reset. Please try again.';

        dispatch(showSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        }));

      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, newPassword }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reset password. Please try again.';

      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDeliveryAddress = createAsyncThunk(
  'auth/fetchDeliveryAddress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/delivery-address');
      return response.data.address;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch delivery address.';
      return rejectWithValue(errorMessage);
    }
  },
);

/* -------------------------- Slice -------------------------- */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,

    authLoading: false,
    initializing: true,

    error: null,

    deliveryAddress: null,
  },

  reducers: {
    logout: (state, action) => {
      state.user = null;
      state.token = null;
      clearAuthData();
    },
  },

  extraReducers: builder => {
    builder

      /* -------- Register -------- */
      .addCase(registerUser.pending, state => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })

      /* -------- Login -------- */
      .addCase(loginUser.pending, state => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      /* -------- Load User -------- */
      .addCase(loadUserFromStorage.pending, state => {
        state.initializing = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.initializing = false;
        state.error = action.payload || 'Failed to load user';
      })

      /* -------- Update Profile -------- */
      .addCase(updateUserProfile.pending, state => {
        state.authLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload || 'Failed to update profile';
      })

      /* -------- Forgot Password -------- */
      .addCase(forgotPassword.pending, state => {
        state.authLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.authLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = null;
      })

      /* -------- Reset Password -------- */
      .addCase(resetPassword.pending, state => {
        state.authLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.authLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload || 'Failed to reset password';
      })
      /* -------- Fetch Delivery Address -------- */
      .addCase(fetchDeliveryAddress.pending, state => {
        state.authLoading = true;
      })
      .addCase(fetchDeliveryAddress.fulfilled, (state, action) => {
        state.authLoading = false;
        state.deliveryAddress = action.payload;
        state.error = null;
      })
      .addCase(fetchDeliveryAddress.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload || 'Failed to fetch delivery address';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
