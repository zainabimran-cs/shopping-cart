"use client";

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

  function handleSubmit(e) {
    e.preventDefault();

    mutation.mutate({
      name,
      price: Number(price),
    });
  }

  return (
    <div>
      <h1>Add Product</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Product Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Adding..." : "Add Product"}
        </button>

        {mutation.isError && <p>{mutation.error.message}</p>}
      </form>
    </div>
  );
}
