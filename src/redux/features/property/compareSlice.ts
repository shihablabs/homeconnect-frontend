import { PropertyResponse } from '@/types/property.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Store a minimal version of the property to avoid bloated state
interface CompareItem {
  id: string;
  title: string;
  images: string[];
  rentPrice?: number;
  salePrice?: number;
  currency?: string;
  listingType: 'rent' | 'sale';
}

interface CompareState {
  items: CompareItem[];
  maxItems: number;
}

const initialState: CompareState = {
  items: [],
  maxItems: 3,
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<PropertyResponse>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (exists) return;

      if (state.items.length >= state.maxItems) {
        return;
      }

      // Check if listingType matches existing items
      if (state.items.length > 0) {
        const currentListingType = state.items[0].listingType;
        if (action.payload.listingType !== currentListingType) {
          // We'll handle the notification in the component
          return;
        }
      }

      const newItem: CompareItem = {
        id: action.payload.id,
        title: action.payload.title,
        images: action.payload.images,
        currency: action.payload.currency || 'BDT',
        listingType: action.payload.listingType,
      };

      if (action.payload.listingType === 'rent') {
        newItem.rentPrice = action.payload.rentPrice;
      } else {
        newItem.salePrice = action.payload.salePrice;
      }

      state.items.push(newItem);
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
