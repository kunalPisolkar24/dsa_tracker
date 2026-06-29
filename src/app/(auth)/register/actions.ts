"use server";

import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

interface ActionResult {
  error: string | null;
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await getAuth().signUp.email({ name, email, password });

  if (error) {
    return { error: error.message ?? "Failed to create account" };
  }

  redirect("/dashboard");
}
