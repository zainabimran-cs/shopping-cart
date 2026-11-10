"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} from "./redux/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/productService";

export default function Home() {
  const cartItems = useSelector((state) => state.cart.cartItems);

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
  if (isLoading) {
  return <p>Loading products...</p>;
}

if (isError) {
  return <p>Error: {error.message}</p>;
}
  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h2>
          <p className="text-gray-600 mt-1 mb-4">Price: Rs. {product.price}</p>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
            onClick={() => dispatch(addToCart(product))}
          >
            Add to Cart
          </button>
        </div>
      ))}

      {cartItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow p-5 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>

          <p className="text-gray-600 mt-1 mb-4">Price: Rs. {item.price}</p>

          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              onClick={() => dispatch(incrementQuantity(item.id))}
            >
              +
            </button>

            <span className="font-medium text-gray-700">
              {" "}
              Quantity: {item.quantity}{" "}
            </span>

            <button
              className="w-9 h-9 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              onClick={() => dispatch(decrementQuantity(item.id))}
            >
              -
            </button>

            <button
              className="ml-auto bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
              onClick={() => dispatch(removeFromCart(item.id))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
