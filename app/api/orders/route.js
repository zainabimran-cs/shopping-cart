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
  let mongoSession;

  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession?.user?.email) {
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

    const { db, client } = await connectToDatabase();
    mongoSession = client.startSession();

    let newOrder;
    let orderId;

    await mongoSession.withTransaction(async () => {
      const productIds = items.map((item) => new ObjectId(item.productId));

      const products = await db
        .collection("products")
        .find({ _id: { $in: productIds } }, { session: mongoSession })
        .toArray();

      const missingProducts = items.filter(
        (item) =>
          !products.some(
            (product) => product._id.toString() === item.productId,
          ),
      );

      if (missingProducts.length > 0) {
        const error = new Error("Product no longer available");
        error.code = "PRODUCT_NOT_FOUND";
        error.products = missingProducts.map((item) => ({
          productId: item.productId,
        }));
        throw error;
      }

      // Reduce stock using one conditional update
      const insufficientProducts = [];

      for (const item of items) {
        const stockUpdate = await db.collection("products").updateOne(
          {
            _id: new ObjectId(item.productId),
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session: mongoSession },
        );

        if (stockUpdate.matchedCount === 0) {
          const product = products.find(
            (p) => p._id.toString() === item.productId,
          );

          const latestProduct = await db
            .collection("products")
            .findOne(
              { _id: new ObjectId(item.productId) },
              { session: mongoSession },
            );

          insufficientProducts.push({
            productId: item.productId,
            name: product?.name ?? "Unknown product",
            stockLeft: latestProduct?.stock ?? 0,
          });
        }
      }

      if (insufficientProducts.length > 0) {
        const error = new Error("Insufficient stock");
        error.code = "INSUFFICIENT_STOCK";
        error.products = insufficientProducts;
        throw error;
      }

      const orderItems = items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId,
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

      newOrder = {
        userEmail: userSession.user.email,
        items: orderItems,
        total,
        status: "pending",
        createdAt: new Date(),
      };

      // Save order in the same transaction
      const response = await db.collection("orders").insertOne(newOrder, {
        session: mongoSession,
      });

      orderId = response.insertedId;
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId,
        total: newOrder.total,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST ORDER ERROR:", error);

    if (error.code === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        {
          message: error.products
            .map(
              (product) => `Only ${product.stockLeft} left of ${product.name}`,
            )
            .join(", "),
          products: error.products,
        },
        { status: 409 },
      );
    }

    if (error.code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Some products are no longer available",
          products: error.products,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 },
    );
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
}
