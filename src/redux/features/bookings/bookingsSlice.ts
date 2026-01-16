import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  intent: {
    propertyId: string | null;
    tourId: string | null;
  };
  currentStep: number;
}

const initialState: BookingState = {
  intent: {
    propertyId: null,
    tourId: null,
  },
  currentStep: 1,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookingIntent: (state, action: PayloadAction<{ propertyId: string; tourId?: string }>) => {
      state.intent.propertyId = action.payload.propertyId;
      state.intent.tourId = action.payload.tourId || null;
      state.currentStep = 2; // Auto-skip to step 2 when intent is set
    },
    clearBookingIntent: (state) => {
      state.intent.propertyId = null;
      state.intent.tourId = null;
      state.currentStep = 1;
    },
    setBookingStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
  },
});

export const { setBookingIntent, clearBookingIntent, setBookingStep } = bookingsSlice.actions;
export default bookingsSlice.reducer;
