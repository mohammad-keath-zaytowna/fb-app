import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be positive"),
  description: z.string().optional(),
  image: z.any().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
});

