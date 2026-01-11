import * as z from "zod";
import { TFunction } from "i18next";

export const getOrderFormSchema = (t: TFunction) => {
  return z.object({
    userName: z.string().min(1, t("userNameRequired")),
    phoneNumber: z
      .string()
      .min(1, t("phoneNumberRequired"))
      .min(8, t("phoneNumberMinLength")),
    address: z.string().min(1, t("deliveryAddressRequired")),
    shipping: z
      .number()
      .min(0, t("shippingCostMinimum"))
      .nonnegative(t("shippingCostNegative")),
    discount: z
      .number()
      .min(0, t("discountMinimum"))
      .nonnegative(t("discountNegative"))
      .default(0),
    notes: z.string().optional(),
    userNotes: z.string().optional(),
    facebookProfile: z.string().optional(),
  });
};

// For backward compatibility and type inference
export type OrderFormSchema = ReturnType<typeof getOrderFormSchema>;

