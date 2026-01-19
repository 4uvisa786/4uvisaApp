import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import serviceReducer from '../redux/slices/serviceSlice';
import snackbarReducer from './slices/snackbarSlice';
import airTicketReducer from './slices/airTicketSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    user: userReducer,
    auth: authReducer,
    service: serviceReducer,
    airTicket: airTicketReducer,  
    snackbar: snackbarReducer,
    ui: uiSlice.reducer
  },
});
