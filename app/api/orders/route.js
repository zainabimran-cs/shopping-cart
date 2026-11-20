import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createOrderSchema } from "@/validations/orderValidation";

// GET: Fetch logged-in user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    const { db } = await connectToDatabase();

    const orders = await db
      .collection("orders")
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST: Create a new order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { items } = result.data;

    if (items.some((item) => !ObjectId.isValid(item.productId))) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();

    const productIds = items.map((item) => new ObjectId(item.productId));

    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    const missingProducts = items.filter(
      (item) =>
        !products.some((product) => product._id.toString() === item.productId),
    );

    if (missingProducts.length > 0) {
      return NextResponse.json(
        {
          message: `Products no longer available: ${missingProducts
            .map((item) => item.productId)
            .join(", ")}`,
        },
        { status: 409 },
      );
    }

    const orderItems = items.map((item) => {
      const product = products.find(
        (product) => product._id.toString() === item.productId,
      );

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newOrder = {
      userEmail: session.user.email,
      items: orderItems,
      total,
      status: "pending",
      createdAt: new Date(),
    };

    const response = await db.collection("orders").insertOne(newOrder);

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: response.insertedId,
        total,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 },
    );
  }
}
