"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

// Completes an invite or reset link: exchanges the single-use token for a
// password of the person's own choosing, then signs them straight in —
// resetPassword returns a fresh session token, so there's no second "now log
// in" step to trip over. Mirrors the cookie handling in /login/actions.js.
export async function setPasswordAndSignIn(_prevState, formData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (!token) {
    return { error: "This link is incomplete. Ask for a new one." };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }

  const payload = await getPayload({ config });

  let result;
  try {
    result = await payload.resetPassword({
      collection: "users",
      data: { token, password },
      overrideAccess: true,
    });
  } catch {
    // Token consumed, expired, or superseded by a newer link.
    return {
      error:
        "This link has already been used or has expired. Ask a team admin to send you a new one.",
    };
  }

  // First proof the person holds this account — the Team page shows accounts
  // without joinedAt as "Invited". Never overwrite (a joined member using a
  // reset link keeps their original join date); never let it block the sign-in.
  if (result?.user?.id && !result.user.joinedAt) {
    await payload
      .update({
        collection: "users",
        id: result.user.id,
        data: { joinedAt: new Date().toISOString() },
      })
      .catch(() => {});
  }

  if (result?.token) {
    const cookieStore = await cookies();
    cookieStore.set("payload-token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  // Outside try/catch — redirect() throws control flow the catch must not eat.
  redirect("/admin");
}
