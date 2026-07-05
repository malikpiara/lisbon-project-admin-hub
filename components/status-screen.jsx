import { IconLisbonBrandMark } from "@/components/icons/ds-icons";

// Shared, DS-styled full-screen state used by the 404 and error pages
// (not-found, global-not-found, error, global-error). Purely presentational and
// hook-free so it works in both server and client (error-boundary) files.
//
// `actions` are passed as children so each caller supplies its own links or
// buttons (a plain <Link> for navigation, a real <button> for "try again").
/**
 * @param {object} props
 * @param {import('react').ElementType} [props.icon] - icon rendered in the badge
 * @param {string} [props.code] - large status code, e.g. "404"
 * @param {import('react').ReactNode} props.title
 * @param {import('react').ReactNode} props.description
 * @param {import('react').ReactNode} props.children - action links/buttons
 */
export function StatusScreen({
  icon: Icon = IconLisbonBrandMark,
  code,
  title,
  description,
  children,
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-mint px-6 py-16">
      <div className="animate-entry-appear w-full max-w-md rounded-lg border-2 border-secondary bg-card px-8 py-10 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg border-2 border-bg-mint bg-brand-000 text-primary">
          <Icon className="size-7" />
        </div>

        {code ? (
          <p className="mt-8 font-heading text-ds-xxxxl font-bold leading-none tracking-tight text-brand-900">
            {code}
          </p>
        ) : null}

        <h1 className="mt-4 font-heading text-ds-xl font-bold text-brand-dark">
          {title}
        </h1>
        <p className="mt-3 text-ds-s font-medium text-brand-deep">
          {description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>
      </div>
    </main>
  );
}
