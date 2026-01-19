import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { showSnackbar } from './snackbarSlice';

export const bookAirTicket = createAsyncThunk(
  'user/book-air-ticket',
  async (bookingData, { dispatch, rejectWithValue }) => {
    console.log('Booking Data in Thunk:', bookingData);
    try {
      const response = await axiosInstance.post(
        '/air-bookings/book',
        bookingData,
      );
      // Show success snackbar
      dispatch(showSnackbar({
        message: response.data.message,
        type: 'success',
        duration: 3000,
      }));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to book air ticket. Please try again.';
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 3000,
      }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'user/fetch-my-bookings',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/air-bookings/my-bookings');
      return response.data;
    } catch (error) {
      console.log('Error fetching bookings:', error.response?.data?.message || error.message);
      const errorMessage = error.response?.data?.message || 
                          'Failed to fetch bookings. Please try again.';
      dispatch(showSnackbar({
        message: errorMessage,
        type: 'error',
        duration: 3000,
      }));
      return rejectWithValue(errorMessage);
    }
  }
);


export const fetchAirports = createAsyncThunk(
  "airport/fetch-airports",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/air-bookings/airports");
      return response.data.data; // <-- airports array
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch airports";

      dispatch(
        showSnackbar({
          message,
          type: "error",
          duration: 3000,
        })
      );

      return rejectWithValue(message);
    }
  }
);


const airTicketSlice = createSlice({
  name: 'airTicket',
  initialState: {
    bookings: [],
    airports: [],
    loading: false,
    error: null,
  },
  extraReducers: builder =>{
    builder
      .addCase(bookAirTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAirTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(bookAirTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAirports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.loading = false;
        state.airports = action.payload;
      })
      .addCase(fetchAirports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }

});

export default airTicketSlice.reducer;