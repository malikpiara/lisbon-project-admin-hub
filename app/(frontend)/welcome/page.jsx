import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import { Button } from "@/components/ui/button";
import { WelcomeForm } from "./welcome-form";

export const metadata = {
  // Absolute title bypasses the public brand template; noindex keeps these
  // one-time links out of search results.
  title: { absolute: "Set your password · Admin Hub" },
  robots: { index: false, follow: false },
};

// The landing page for invite and password-reset links. The token is checked
// up front so a dead link fails immediately with a way out — not after the
// person has already chosen and typed a password.
export default async function WelcomePage({ searchParams }) {
  await connection();
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";
  const isInvite = params?.new === "1";

  let account = null;
  if (token) {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "users",
      where: { resetPasswordToken: { equals: token } },
      limit: 1,
      depth: 0,
      showHiddenFields: true,
    });
    const match = docs[0];
    const expires = match?.resetPasswordExpiration
      ? new Date(match.resetPasswordExpiration)
      : null;
    if (match && expires && expires > new Date()) {
      account = { name: match.name || "", email: match.email };
    }
  }

  const firstName = account?.name ? account.name.split(/\s+/)[0] : "";

  return (
    <div className="flex min-h-svh flex-col bg-card p-6 md:p-10">
      <div className="flex justify-center">
        <Image
          src="/lisbon-project-logo.svg"
          alt="The Lisbon Project"
          width={108}
          height={43}
          priority
          unoptimized
          className="h-9 w-auto"
        />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          {account ? (
            <>
              <div className="mb-7 text-center">
                <h1 className="font-heading text-ds-l font-bold text-foreground">
                  {isInvite
                    ? firstName
                      ? `Welcome, ${firstName}`
                      : "Welcome to Admin Hub"
                    : "Choose a new password"}
                </h1>
                <p className="mt-1.5 text-ds-xs font-medium text-muted-foreground">
                  {isInvite
                    ? "Choose a password to finish setting up your account."
                    : "Your old password stops working once you save."}
                </p>
                <p className="mt-1.5 text-ds-xxs font-medium text-muted-foreground">
                  Signing in as <span className="font-bold text-foreground">{account.email}</span>
                </p>
              </div>
              <WelcomeForm token={token} />
            </>
          ) : (
            <div className="text-center">
              <h1 className="font-heading text-ds-l font-bold text-foreground">
                This link doesn&rsquo;t work anymore
              </h1>
              <p className="mt-2 text-ds-xs font-medium text-muted-foreground">
                Links like this work once and expire after a few days. Ask a
                team admin to send you a new one — it only takes them a moment.
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Go to sign in
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
