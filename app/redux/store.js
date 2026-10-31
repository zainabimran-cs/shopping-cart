import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

export const store = configureStore({
    reducer: {
        cart: cartReducer
    },  //	State ko update karne ka logic rakhta hai.
})


//Redux Store mein selected cart items honge.
//page.js mein available products ki array hogi.