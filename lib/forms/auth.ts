import * as z from "zod";

export const loginformSchema = z.object({
  email: z.string().email("must be a valid email"),
  password: z
    .string()
    .min(6, "must be at least 6 characters")
    .max(20, "must be at most 20 characters"),
});

export const signupFormSchema = z
  .object({
    name: z.string().min(2, "must be at least 2 characters"),
    email: z.string().email("must be a valid email"),
    password: z
      .string()
      .min(6, "must be at least 6 characters")
      .max(20, "must be at most 20 characters"),
    confirmPassword: z
      .string()
      .min(6, "must be at least 6 characters")
      .max(20, "must be at most 20 characters"),
    agreeToTerms: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("must be a valid email"),
});

export const verificationCodeFormSchema = z.object({
  code: z.string().min(6, "must be 6 characters").max(6, "must be 6 characters"),
});

export const resetPasswordformSchema = z
  .object({
    password: z
      .string()
      .min(8, "must be at least 8 characters")
      .max(20, "must be at most 20 characters"),
    confirmPassword: z
      .string()
      .min(8, "must be at least 8 characters")
      .max(20, "must be at most 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

