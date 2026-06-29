"use server";

import { signIn } from "@/lib/auth";

interface ActionResult {
  error: string | null;
}

export async function signInAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (error) {
    if ((error as any)?.code === "CREDENTIALS_REQUIRED" || (error as any)?.type === "CredentialsSignin") {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}
