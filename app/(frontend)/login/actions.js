"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

// Custom login for the DS-styled /admin. Authenticates against the same Payload
// `users` collection as /cms-admin, then sets the `payload-token` session cookie
// (the one payload.auth() reads), so /admin recognises the session. On success
// it redirects to /admin; the Payload-native /cms-admin login is left untouched.
export async function login(_prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password" };
  }

  const payload = await getPayload({ config });

  let result;
  try {
    result = await payload.login({
      collection: "users",
      data: { email, password },
    });
  } catch {
    return { error: "Those credentials don't match. Try again." };
  }

  if (!result?.token) {
    return { error: "Those credentials don't match. Try again." };
  }

  // Mirror Payload's own cookie (httpOnly JWT named payload-token) so the
  // session is portable to /admin's server components and actions.
  const cookieStore = await cookies();
  cookieStore.set("payload-token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(result.exp ? { expires: new Date(result.exp * 1000) } : {}),
  });

  // Outside try/catch — redirect() throws control flow that the catch must not eat.
  redirect("/admin");
}
