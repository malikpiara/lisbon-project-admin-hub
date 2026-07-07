import { headers as nextHeaders } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";

import { LoginForm } from "./login-form";

export const metadata = {
  // Absolute title bypasses the public brand template; noindex keeps the login
  // out of search results.
  title: { absolute: "Sign in · Admin Hub" },
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Reads a session, so it must render per-request — never prerendered at build
  // (booting Payload with no PAYLOAD_SECRET). See lib/admin-auth for the same fix.
  await connection();

  // Already signed in → go straight to the admin. (Checked inline rather than via
  // authedPayload, which would redirect back here and loop.)
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (user) redirect("/admin");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col gap-8 bg-card p-6 md:p-10">
        <div className="flex justify-center lg:justify-start">
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
            <div className="mb-7 text-center lg:text-left">
              <h1 className="font-heading text-ds-l font-bold text-foreground">
                Sign in to Admin Hub
              </h1>
              <p className="mt-1.5 text-ds-xs font-medium text-muted-foreground">
                Use your team account to continue.
              </p>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-ds-xxs font-medium text-muted-foreground lg:text-left">
              Staff access only. Forgot your password? Ask a team admin to
              send you a reset link.
            </p>
          </div>
        </div>
      </div>

      {/* Cover side — brand panel, hidden on small screens (login-02 pattern).
          Logo lives only on the form side; this panel is copy-only. */}
      <div className="relative hidden flex-col justify-end bg-brand-900 p-12 lg:flex">
        <div className="max-w-md">
          <p className="font-heading text-ds-xl font-bold leading-tight text-brand-000">
            Supporting people who&rsquo;ve made Lisbon their new home.
          </p>
          <p className="mt-3 text-ds-s font-medium text-brand-300">
            The Admin Hub is where the team keeps services, topics, and contacts
            up to date for our community.
          </p>
        </div>
      </div>
    </div>
  );
}
