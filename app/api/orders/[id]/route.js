import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// PATCH: Update order status or cancel an order
export async function PATCH(request, { params }) {
  let mongoSession;

  try {
    // 1. Check logged-in user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    // 2. Get order ID from URL
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    // 3. Read request body
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { status: newStatus } = body;

    const validStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 },
      );
    }

    // 4. Check admin permission
    const isAdmin = session.user.isAdmin === true;

    if (!isAdmin && newStatus !== "cancelled") {
      return NextResponse.json(
        { message: "Only admins can update order status" },
        { status: 403 },
      );
    }

    // 5. Connect to MongoDB and start session
    const { db, client } = await connectToDatabase();

    mongoSession = client.startSession();

    let updatedOrder;

    // 6. Start transaction
    await mongoSession.withTransaction(async () => {
      // Find requested order
      const order = await db.collection("orders").findOne(
        { _id: new ObjectId(id) },
        { session: mongoSession },
      );

      if (!order) {
        const error = new Error("Order not found");
        error.code = "ORDER_NOT_FOUND";
        throw error;
      }

      // 7. Check order ownership for normal users
      if (!isAdmin && order.userEmail !== session.user.email) {
        const error = new Error("You cannot cancel this order");
        error.code = "FORBIDDEN";
        throw error;
      }

      // 8. Define allowed status transitions
      const allowedTransitions = {
        pending: ["paid", "cancelled"],
        paid: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
      };

      if (!allowedTransitions[order.status]?.includes(newStatus)) {
        const error = new Error("Invalid order status transition");
        error.code = "INVALID_TRANSITION";
        throw error;
      }

      // 9. Update order status conditionally
      const statusUpdate = await db.collection("orders").updateOne(
        {
          _id: new ObjectId(id),
          status: order.status,
        },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
          },
        },
        { session: mongoSession },
      );

      if (statusUpdate.matchedCount === 0) {
        const error = new Error("Order status has already changed");
        error.code = "STATUS_CONFLICT";
        throw error;
      }

      // 10. Restore stock when order is cancelled
      if (newStatus === "cancelled") {
        for (const item of order.items) {
          const stockUpdate = await db.collection("products").updateOne(
            { _id: item.productId },
            {
              $inc: {
                stock: item.quantity,
              },
            },
            { session: mongoSession },
          );

          if (stockUpdate.matchedCount === 0) {
            const error = new Error("Product not found");
            error.code = "PRODUCT_NOT_FOUND";
            throw error;
          }
        }
      }

      updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date(),
      };
    });

    // 11. Return successful response
    return NextResponse.json(
      {
        message: newStatus === "cancelled"
          ? "Order cancelled successfully"
          : "Order status updated successfully",
        order: updatedOrder,
      },
      { status: 200 },
    );

  } catch (error) {
    console.error("PATCH ORDER ERROR:", error);

    if (error.code === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    if (error.code === "FORBIDDEN") {
      return NextResponse.json(
        { message: "You cannot cancel someone else's order" },
        { status: 403 },
      );
    }

    if (
      error.code === "INVALID_TRANSITION" ||
      error.code === "STATUS_CONFLICT"
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    if (error.code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { message: "A product in this order no longer exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );

  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
}
