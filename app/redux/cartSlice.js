import { createSlice } from "@reduxjs/toolkit";

export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find(
        (item) => item._id === action.payload._id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload,
      );
    },

    incrementQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item._id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },

    decrementQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item._id === action.payload);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    setCart: (state, action) => {
    state.cartItems = action.payload;
},
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  setCart
} = cartSlice.actions;
export default cartSlice.reducer;
