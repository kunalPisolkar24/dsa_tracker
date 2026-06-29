"use server";

import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

interface ActionResult {
  error: string | null;
}

export async function signInAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await getAuth().signIn.email({ email, password });

  if (error) {
    return { error: error.message ?? "Invalid credentials" };
  }

  redirect("/dashboard");
}
