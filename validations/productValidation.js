import { z } from "zod";

export const registerProductSchema = z.object({
  name: z
    .string({message:"Name is required"})
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" }),

  price: z.number({message:"Price is required"}).positive({message:"Price must be a positive number"}),
});
