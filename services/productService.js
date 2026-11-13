function handleError(response, data, errorMessage) {
  if (!response.ok) {
    throw new Error(data?.message || errorMessage);
  }
}

export async function getProducts() {
  const response = await fetch("/api/products");

  const data = await response.json().catch(() => null);

  handleError(response, data, "Failed to fetch products");

  return data;
}

export async function addProduct(product) {
  const response = await fetch("/api/products",{
    method:"POST",
    headers: {
    "Content-Type": "application/json"
    },
    body:JSON.stringify(product)
  });
  const data = await response.json().catch(()=>null);
  handleError(response,data, "Failed to add Product");
  return data;
}