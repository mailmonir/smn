"use server";

import { signupSchema } from "../auth-schema";
import { auth } from "@/lib/auth";
import z from "zod";

interface ActionResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]> | undefined;
}

export async function signupAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = signupSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const response = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    if (response.user) {
      return {
        success: true,
        message:
          "Account created successfully. Please check your email for verification",
      };
    } else {
      return {
        success: false,
        message: "There was some problem creating your account",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("signup error", error);
      return { success: false, message: error.message };
    } else {
      console.error("signup error", error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
}
