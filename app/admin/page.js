"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProduct } from "@/services/productService";

export default function AdminPage() {

  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setName("");
      setPrice("");
      alert("Product added successfully");
    },
  });


  const { data: session, status } = useSession();

if (status === "loading") {
  return <p>Loading...</p>;
}

if (!session) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Please sign in</h1>
      <button
        onClick={() => signIn("github")}
        className="bg-gray-900 text-white px-6 py-3 rounded-lg"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}

if (!session.user?.isAdmin) {
  return <p>Not allowed</p>;
}

  function handleSubmit(e) {
    e.preventDefault();

    mutation.mutate({
      name,
      price: Number(price),
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Add Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Price
            </label>
            <input
              type="number"
              placeholder="Enter product price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Adding..." : "Add Product"}
          </button>

          {mutation.isError && (
            <p className="text-sm text-red-600 text-center">
              {mutation.error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
