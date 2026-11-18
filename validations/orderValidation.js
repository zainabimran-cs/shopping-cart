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
              .positive("Quantity must be a positive integer"),
          })
          .strict(),
      )
      .min(1, "Cart cannot be empty"),
  })
  .strict();