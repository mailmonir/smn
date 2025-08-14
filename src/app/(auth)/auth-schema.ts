import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, { message: "Required" }),
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Required" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Required" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Required" })
    .email({ message: "Invalid email address" }),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

// Optional: get the inferred TypeScript type
export type SignupSchemaData = z.infer<typeof signupSchema>;
export type LoginSchemaData = z.infer<typeof loginSchema>;
export type ForgotPasswordSchemaData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaData = z.infer<typeof resetPasswordSchema>;
