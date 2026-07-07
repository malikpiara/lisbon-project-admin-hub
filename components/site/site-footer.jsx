import Link from "next/link";

import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconMail,
  IconWhatsapp,
} from "@/components/icons/ds-icons";
import { NewsletterForm } from "./newsletter-form";

const socials = [
  { label: "Facebook", icon: IconFacebook, href: "#" },
  { label: "Instagram", icon: IconInstagram, href: "#" },
  { label: "LinkedIn", icon: IconLinkedin, href: "#" },
  {
    label: "WhatsApp",
    icon: IconWhatsapp,
    href: "https://www.whatsapp.com/channel/0029VafBNaFGk1Fk5kWxqQ1o",
  },
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

          <NewsletterForm />
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
          <p className="mt-2 text-ds-xxs font-bold text-brand-deep">
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
