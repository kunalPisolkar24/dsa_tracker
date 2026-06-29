"use server";

import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await getAuth().signOut();
  redirect("/");
}
