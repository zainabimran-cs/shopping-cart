function handleError(response, data) {
  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch products");
  }
}

export async function getProducts() {
  const response = await fetch("/api/products");

  const data = await response.json().catch(() => null);

  handleError(response, data);

  return data;
}