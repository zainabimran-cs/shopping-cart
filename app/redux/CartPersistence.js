"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./cartSlice";

export default function CartPersistence() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems);

  const isFirstRender = useRef(true);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const convertedCart = parsedCart
            .map((item) => ({
              productId: item.productId || item._id,
              quantity: item.quantity,
            }))
            .filter(
              (item) =>
                typeof item.productId === "string" &&
                item.productId.trim() !== "" &&
                Number.isInteger(item.quantity) &&
                item.quantity >= 1 &&
                item.quantity <= 10,
            );

          dispatch(setCart(convertedCart));
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      dispatch(setCart([]));
    }
  }, [dispatch]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  return null;
}
