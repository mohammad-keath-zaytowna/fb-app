import * as z from "zod";

export const orderFormSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  shipping: z.coerce.number().min(0, "Shipping must be 0 or greater"),
  notes: z.string().optional(),
  userNotes: z.string().optional(),
  facebookProfile: z.string().optional(),
});

