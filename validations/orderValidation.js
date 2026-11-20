import { z } from "zod";

export const createOrderSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1, "Product ID is required"),
            quantity: z
              .number()
              .int()
              .min(1, "Quantity must be at least 1")
              .max(10, "Quantity cannot exceed 10"),
          })
          .strict(),
      )
      .min(1, "Cart cannot be empty")
      .refine(
        (items) =>
          new Set(items.map((item) => item.productId)).size === items.length,
        "Duplicate products are not allowed",
      ),
  })
  .strict();
