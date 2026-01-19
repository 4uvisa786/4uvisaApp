// redux/slices/snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    open: false,
    message: '',
    type: 'success', // success, error, warning, info
    duration: 3000,
  },
  reducers: {
    showSnackbar: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.duration = action.payload.duration || 3000;
    },
    hideSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
