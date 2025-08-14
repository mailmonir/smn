"use server";

import { loginSchema } from "../auth-schema";
import { cookies } from "next/headers";
import z from "zod";
import { auth } from "@/lib/auth";

interface ActionResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]> | undefined;
}

// interface LoginResponse {
//   exp?: number
//   token?: string
//   user?: User
// }

export async function loginAction(formData: FormData): Promise<ActionResponse> {
  try {
    const data = Object.fromEntries(formData.entries());
    // data.email = ''
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    // const payload = await getPayload({ config })

    // const result = await payload.login({
    //   collection: 'users',
    //   data: { email: parsed.data.email, password: parsed.data.password },
    // })

    const response = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    console.log(response);

    if (response.token) {
      const cookieStore = await cookies();
      cookieStore.set("payload-token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return { success: true, message: "Login successful" };
    } else {
      return { success: false, message: "Server error. Login failed" };
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
