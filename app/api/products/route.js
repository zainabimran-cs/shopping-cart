import { connectToDatabase } from "@/lib/mongodb";
import { registerProductSchema } from "@/validations/productValidation";
import { NextResponse } from "next/server";

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
    const body = await request.json();
    const result = registerProductSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const newProduct = {
      name: body.name,
      price: body.price,
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
    console.error("POST PRODUCT ERROR:" ,error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 },
    );
  }
}
