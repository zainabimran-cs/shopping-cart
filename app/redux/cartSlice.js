import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],            //Starting mein cart empty hai.
};

const cartSlice = createSlice({
    name: "cart",  //Ye slice ka naam hai.
    initialState,    //initialState ka matlab hai application ke start hone par state mein konsa data hoga.
    reducers: { //State update karne ke functions rakhta hai.
        // addTOCart ->	Reducer function ka naam
        //	action -> Jo information reducer ko milti hai
        //action.payload ->	Jo product add karna hai (Product ki information)
        //push() -> Product ko array mein add karta hai
        //


        //Quantity Increment aur Decrement 

        // Shopping cart mein agar user ek product 3 times add karta hai, to hum quantity 3 show karna chahte hain, instead of same product ko baar baar separate item banana.

        //Existing product add karne par quantity increase ho, duplicate na bane

        addToCart: (state, action) => { // existingItem -> mein matching product milta hai.
            const existingItem = state.cartItems.find( //->check karta hai ke product pehle se cart mein mojood hai ya nahi.
                (item) => item.id === action.payload.id
            );

            //    item.id = cart ke existing product ki ID
            // action.payload.id = naye selected product ki ID.

            if (existingItem) {
                existingItem.quantity += 1;   //yes-> Existing quantity mein 1 add hoga
            } else {
                state.cartItems.push({
                    ...action.payload,   //->product ki existing information copy karta hai.
                    quantity: 1,         //NO-> New object add hoga with quantity: 1
                });
            }
        },

        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(
                (item) => item.id !== action.payload);
        },

        incrementQuantity: (state, action) => { //  incrementQuantity->Reducer ka name hai.
            const item = state.cartItems.find(
                (item) => item.id === action.payload
            );

            if (item) {
                item.quantity += 1;
            }
        },

        decrementQuantity: (state, action) => {
            const item = state.cartItems.find(
                (item) => item.id === action.payload
            );

            if (item && item.quantity > 1) { //item check karta hai ke product exist karta hai cart ma
                item.quantity -= 1;       //Iska matlab quantity 1 ho to decrement nahi hogi.
            }
        },

    }
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity } = cartSlice.actions;
export default cartSlice.reducer;