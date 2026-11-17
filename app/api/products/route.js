
import { connectToDatabase } from "@/lib/mongodb";
import { registerProductSchema } from "@/validations/productValidation";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();

    const products = await db.collection("products").find({}).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Step 1: Check login
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 },
      );
    }

    // Step 2: Check admin access
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 },
      );
    }

    // Step 3: Check valid JSON
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    // Step 4: Validate product
    const result = registerProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    // Step 5: Save product
    const { db } = await connectToDatabase();

    const newProduct = {
      name: result.data.name,
      price: result.data.price,
    };

    const response = await db.collection("products").insertOne(newProduct);

    return NextResponse.json(
      {
        message: "Product added successfully",
        productId: response.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to add product" },
      { status: 500 },
    );
  }
}
