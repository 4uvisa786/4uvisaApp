import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchServiceScrollSpeed = createAsyncThunk(
    'ui/fetchServiceScrollSpeed',
    async (_, { rejectWithValue }) => {
        console.log('Fetching service scroll speed from API...');
        try {
            const response = await axiosInstance.get('/ui/ui-config');
            console.log('Fetched service scroll speed:', response.data.serviceScrollSpeed);
            return response.data.serviceScrollSpeed; // Assuming the API returns { scrollSpeed: number }
        } catch (error) {
            console.error('Error fetching service scroll speed:', error.message);
            const errorMessage = error.response?.data?.message || 'Failed to fetch service scroll speed';
            return rejectWithValue(errorMessage);
        }
    }
);

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        serviceScrollSpeed: 30, // Default scroll speed
        loading: false,
        error: null,
    },
    reducers: {
        setServiceScrollSpeed(state, action) {
            state.serviceScrollSpeed = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchServiceScrollSpeed.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServiceScrollSpeed.fulfilled, (state, action) => {
                state.loading = false;
                state.serviceScrollSpeed = action.payload;
            })
            .addCase(fetchServiceScrollSpeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    }
});

export const { setServiceScrollSpeed } = uiSlice.actions;

export default uiSlice;