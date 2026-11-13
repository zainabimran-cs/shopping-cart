import { z } from "zod";

export const registerProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "name must be atleast 2 characters long" }),

  price: z.number().positive(),
});
