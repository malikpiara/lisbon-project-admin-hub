import { ChevronRight, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// lucide-react v1 dropped brand glyphs, so the socials use inline SVGs.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7h2.3l.4-2.9h-2.7V9.3c0-.8.3-1.4 1.5-1.4h1.3V5.3c-.6-.1-1.4-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.1H8v2.9h2.4V21h3.1Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.5h3.1V21H3.4V8.5Zm5.1 0h3v1.7h.05c.42-.8 1.45-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V21h-3.1v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-3.1V8.5Z" />
    </svg>
  );
}

const socials = [
  { label: "Facebook", icon: FacebookIcon, href: "#" },
  { label: "Instagram", icon: InstagramIcon, href: "#" },
  { label: "LinkedIn", icon: LinkedinIcon, href: "#" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-mint">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-14 sm:px-6 lg:px-14">
        <div className="flex items-center gap-2 text-foreground">
          <Mail className="size-6" />
          <h2 className="font-heading text-ds-xl font-bold">Newsletter</h2>
        </div>

        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[minmax(280px,400px)_1fr]">
          <p className="max-w-sm font-heading text-ds-m font-bold text-brand-dark">
            Get monthly updates on events, programs, and community stories
          </p>

          <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
                First Name <span className="text-primary">*</span>
              </span>
              <input
                type="text"
                placeholder="Your first name"
                className="h-11 w-full rounded-lg border-2 border-input bg-card px-4 text-ds-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
                Email <span className="text-primary">*</span>
              </span>
              <input
                type="email"
                placeholder="Your Email"
                className="h-11 w-full rounded-lg border-2 border-input bg-card px-4 text-ds-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring"
              />
            </label>
            <button
              type="button"
              className={buttonVariants({ className: "px-5" })}
            >
              Subscribe
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <hr className="mt-12 border-t-2 border-secondary" />

        <div className="mt-6">
          <p className="text-ds-xs font-bold text-brand-deep">
            © {year} by Lisbon Project Association. Building community, one
            connection at a time.
          </p>
          <p className="mt-1 text-ds-xxs font-medium text-brand-deep">
            Registered Charity Number: PT514343575
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-lg border-2 border-bg-mint bg-card text-primary transition-colors hover:bg-card/70"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
