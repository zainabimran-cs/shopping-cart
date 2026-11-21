function handleError(response, data, errorMessage) {
  if (!response.ok) {
    throw new Error(data?.message || errorMessage);
  }
}

export async function createOrder(items) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  const data = await response.json().catch(() => null);

  handleError(response, data, "Failed to create order");

  return data;
}

export async function getOrders() {
  const response = await fetch("/api/orders");

  const data = await response.json().catch(() => null);

  handleError(response, data, "Failed to fetch orders");

  return data;
}
