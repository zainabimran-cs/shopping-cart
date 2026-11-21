"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../services/orderService";

export default function OrdersPage() {
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow p-5 mb-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Order ID:{" "}
                <span className="font-medium text-gray-800">{order._id}</span>
              </p>

              <p className="text-sm text-gray-500">
                Order Date:
                <span className="font-medium text-gray-800">
                  {" "}
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </p>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Products
                </h3>

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-gray-600"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>

                      <p className="font-medium">Rs. {item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold text-gray-700">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-gray-900">
                  Rs. {order.total}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Status</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
