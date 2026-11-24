"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  selectCartCount,
  clearCart,
} from "./redux/cartSlice";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createOrder } from "../services/orderService";
import { getProducts } from "../services/productService";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartCount = useSelector(selectCartCount);
  const [showEmptyCartMessage, setShowEmptyCartMessage] = useState(false);

  const dispatch = useDispatch();

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      dispatch(clearCart());
    },
  });

  const cartTotal = cartItems.reduce((total, item) => {
    const product = products.find((product) => product._id === item.productId);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen  bg-gray-50  ">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <Link
        href="/orders"
        className="inline-block mb-6 text-black hover:underline font-medium"
      >
        My Orders
      </Link>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow p-5 mb-6 "
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {product.name}
            </h2>
            <p className="text-gray-600 mt-1 mb-4">
              Price: Rs. {product.price}
            </p>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
              onClick={() => {
                setShowEmptyCartMessage(false);
                orderMutation.reset();
                dispatch(addToCart(product));
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {cartItems.map((item) => {
        const product = products.find(
          (product) => product._id === item.productId,
        );

        if (!product) {
          return (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow p-5 mb-4"
            >
              <p className="text-red-600 font-medium mb-3">
                This product is unavailable.
              </p>

              <button
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
                onClick={() => dispatch(removeFromCart(item.productId))}
              >
                Remove
              </button>
            </div>
          );
        }

        return (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow p-5 mb-4"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {product.name}
            </h2>

            <p className="text-gray-600 mt-1 mb-4">
              Price: Rs. {product.price}
            </p>

            <div className="flex items-center gap-3">
              <button
                className="w-9 h-9 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => dispatch(incrementQuantity(item.productId))}
                disabled={item.quantity >= 10}
              >
                +
              </button>

              <span className="font-medium text-gray-700">
                Quantity: {item.quantity}
              </span>

              <button
                className="w-9 h-9 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
                onClick={() => dispatch(decrementQuantity(item.productId))}
              >
                -
              </button>

              <button
                className="ml-auto bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
                onClick={() => dispatch(removeFromCart(item.productId))}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <p>Total Items: {cartCount}</p>
        <p>Total Price: Rs. {cartTotal}</p>
      </div>

      {orderMutation.isSuccess && !showEmptyCartMessage && (
        <p className="text-green-600 font-medium mb-4">
          Order placed successfully!
        </p>
      )}

      {orderMutation.isError && (
        <p className="text-red-600 font-medium mb-4">
          {orderMutation.error.message}
        </p>
      )}

      {showEmptyCartMessage && cartItems.length === 0 && (
        <p className="text-red-600 font-medium mt-3">
          Your cart is empty. Please add products before checkout.
        </p>
      )}

      <button
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-3 rounded-lg transition mt-4"
        onClick={() => {
          if (cartItems.length === 0) {
            setShowEmptyCartMessage(true);
            return;
          }

          if (!session) {
            signIn("github");
            return;
          }

          orderMutation.mutate(cartItems);
        }}
        disabled={orderMutation.isPending || status === "loading"}
      >
        {orderMutation.isPending ? "Processing..." : "Checkout"}
      </button>
    </div>
  );
}
