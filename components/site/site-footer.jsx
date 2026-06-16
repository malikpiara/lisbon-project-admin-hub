import { buttonVariants } from "@/components/ui/button";
import {
  IconArrowRight,
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconMail,
} from "@/components/icons/ds-icons";

const socials = [
  { label: "Facebook", icon: IconFacebook, href: "#" },
  { label: "Instagram", icon: IconInstagram, href: "#" },
  { label: "LinkedIn", icon: IconLinkedin, href: "#" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-mint">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-14 sm:px-6 lg:px-14">
        <div className="flex items-center gap-2 text-foreground">
          <IconMail className="size-6" />
          <h2 className="font-heading text-ds-xl font-bold">Newsletter</h2>
        </div>

        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[minmax(280px,400px)_1fr] lg:gap-x-[5.5rem]">
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
              <IconArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <hr className="mt-12 border-t-2 border-secondary" />

        <div className="mt-12">
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
