import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · Admin Hub",
};

export default async function LoginPage() {
  // Already signed in → go straight to the admin. (Checked inline rather than via
  // authedPayload, which would redirect back here and loop.)
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (user) redirect("/admin");

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border-2 border-border bg-card p-8 shadow-md">
          <div className="mb-7 flex flex-col items-center text-center">
            <Image
              src="/lisbon-project-logo.svg"
              alt="The Lisbon Project"
              width={108}
              height={43}
              priority
              unoptimized
              className="mb-6 h-11 w-auto"
            />
            <h1 className="font-heading text-ds-l font-bold text-foreground">
              Sign in to Admin Hub
            </h1>
            <p className="mt-1.5 text-ds-xs font-medium text-muted-foreground">
              Use your team account to continue.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-4 text-center text-ds-xxs font-medium text-muted-foreground">
          The Lisbon Project · staff access only
        </p>
      </div>
    </main>
  );
}
