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

export async function addProduct(product) {
  const response = await fetch("/api/products",{
    method:"POST",
    header: {
    "Content-Type": "application/json"
    },
    body:JSON.stringify(product)
  });
  const data = await response.json().catch(()=>null);
  handleError(response,data);
  return data;
}