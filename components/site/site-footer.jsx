import Link from "next/link";

import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
  IconMail,
  IconWhatsapp,
} from "@/components/icons/ds-icons";
import { SITE } from "@/lib/site";
import { SITE_TEXT_DEFAULTS } from "@/lib/site-text-defaults";
import { NewsletterForm } from "./newsletter-form";

// Social profiles, in display order; each URL comes from the site-text global.
const SOCIALS = [
  { label: "Facebook", icon: IconFacebook, key: "facebookUrl" },
  { label: "Instagram", icon: IconInstagram, key: "instagramUrl" },
  { label: "LinkedIn", icon: IconLinkedin, key: "linkedinUrl" },
  { label: "WhatsApp", icon: IconWhatsapp, key: "whatsappUrl" },
];

// Text, social links and the charity number come from the site-text global
// (editable at /admin/site-text); `copy` defaults to the shipped text so bare
// renders (styleguide) look as before. A social with no URL is hidden rather
// than rendered as a dead "#" link.
export function SiteFooter({ copy = SITE_TEXT_DEFAULTS }) {
  const year = new Date().getFullYear();
  const socials = SOCIALS.map((s) => ({ ...s, href: (copy[s.key] ?? "").trim() })).filter(
    (s) => s.href
  );

  return (
    <footer className="bg-bg-mint">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-14 sm:px-6 lg:px-14">
        <div className="flex items-center gap-2 text-foreground">
          <IconMail className="size-6" />
          <h2 className="font-heading text-ds-xl font-bold">{copy.newsletterTitle}</h2>
        </div>

        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[minmax(280px,400px)_1fr] lg:gap-x-[5.5rem]">
          <p className="max-w-sm font-heading text-ds-m font-bold text-brand-dark">
            {copy.newsletterBlurb}
          </p>

          <NewsletterForm />
        </div>

        <hr className="mt-12 border-t-2 border-secondary" />

        <div className="mt-12">
          <p className="text-ds-xs font-bold text-brand-deep">
            © {year} by {SITE.legalName}. {copy.footerTagline}
          </p>
          <p className="mt-1 text-ds-xxs font-medium text-brand-deep">
            Registered Charity Number: {copy.charityNumber}
          </p>
          <p className="mt-2 text-ds-xxs font-bold text-brand-deep">
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
          {socials.length ? (
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-11 place-items-center rounded-lg border-2 border-bg-mint bg-card text-primary transition-colors hover:bg-card/70"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
