import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · Lisbon Project",
  description:
    "How the Lisbon Project Association collects, uses, and protects your information.",
};

// Plain-language privacy notice covering what this site actually does: PostHog
// analytics, All Contacts search, the newsletter form, and — most sensitively —
// the help chatbot, whose conversations are logged for the team. DRAFT SCAFFOLD:
// the contact address must be confirmed and the whole notice reviewed by someone
// qualified before it's relied on. A Portuguese translation is strongly advised
// for this audience.
const CONTACT_EMAIL = "privacy@thelisbonproject.org"; // TODO: confirm real address
const LAST_UPDATED = "3 July 2026";

function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-10">
      <h2 className="font-heading text-ds-l font-bold text-brand-dark">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-ds-s font-medium text-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-brand-dark">
          Privacy Policy
        </h1>
        <p className="mt-3 text-ds-xs font-medium text-muted-foreground">
          Last updated {LAST_UPDATED}
        </p>
      </header>

      <div className="mt-8 space-y-3 text-ds-s font-medium text-foreground">
        <p>
          This notice explains how the <strong>Lisbon Project Association</strong>{" "}
          (registered charity PT514343575) collects and uses information when you
          use this website. We keep it short and plain because most of the people
          we serve are navigating a new country, often in a second or third
          language.
        </p>
        <p>
          <strong>The short version:</strong> we collect as little as possible.
          We measure which information people look for so we can improve it, we
          store newsletter sign-ups if you give them, and — if you use our chat
          assistant — your conversation may be stored securely so our team can
          understand what people need. We do not sell your data.
        </p>
      </div>

      <Section id="what-we-collect" title="What we collect and why">
        <p>
          <strong>Usage analytics.</strong> We use PostHog (hosted in the EU) to
          understand which services and information pages people visit most, and
          what people search for in “All Contacts”. This helps us fix gaps in the
          information we provide. Where you type a search, that search text is
          recorded so we can learn what people need that we may not yet list —
          please avoid typing personal details into the search box.
        </p>
        <p>
          <strong>Newsletter.</strong> If you sign up for our newsletter, we store
          the name and email you provide, and use them only to send you updates.
          You can ask us to remove you at any time.
        </p>
        <p>
          <strong>Events calendar.</strong> Our events calendar is drawn from a
          public Google Calendar and does not collect information about you.
        </p>
      </Section>

      <Section id="chat-assistant" title="The chat assistant">
        <p>
          Our site includes a chat assistant to help you find services and
          answers. <strong>To improve this service, your conversation may be
          stored securely and reviewed by our team.</strong> Before storing, we
          automatically remove obvious emails and phone numbers, access is
          restricted to our team, and conversations are kept only for a limited
          period.
        </p>
        <p>
          Please <strong>do not share ID or document numbers, immigration case
          details, health information, or other sensitive personal details</strong>{" "}
          in the chat. If you would rather not have a conversation stored, you can
          contact us another way instead of using the chat.
        </p>
      </Section>

      <Section id="cookies" title="Cookies">
        <p>
          We use a small number of cookies for analytics (to count visits without
          identifying you personally). We do not use advertising cookies. You can
          block cookies in your browser settings; the site will still work.
        </p>
      </Section>

      <Section id="who-we-share-with" title="Who we share information with">
        <p>
          We do not sell your information. We use a few trusted service providers
          who process data on our behalf, under agreements that require them to
          protect it:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>PostHog</strong> — website analytics (EU-hosted).
          </li>
          <li>
            <strong>Zapier</strong> — powers the chat assistant and passes chat
            conversations to us.
          </li>
          <li>
            <strong>Google</strong> — the public events calendar.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law. We aim to keep
          processing within the EU wherever possible.
        </p>
      </Section>

      <Section id="retention" title="How long we keep it">
        <p>
          We keep information only as long as we need it for the purpose it was
          collected. Analytics and chat conversations are kept for a limited
          period and then removed. Newsletter details are kept until you ask us to
          remove them.
        </p>
      </Section>

      <Section id="your-rights" title="Your rights">
        <p>
          Under the EU General Data Protection Regulation (GDPR) and Portuguese
          law, you have the right to ask us for a copy of the information we hold
          about you, to correct it, to delete it, or to object to how we use it.
          Using our services is never conditional on giving up these rights, and
          exercising them will never affect the support we offer you.
        </p>
        <p>
          To make a request, contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-bold text-primary underline"
          >
            {CONTACT_EMAIL}
          </a>
          . You also have the right to complain to the Portuguese data protection
          authority (CNPD).
        </p>
      </Section>

      <Section id="children" title="Children and vulnerable people">
        <p>
          Many people we serve are in vulnerable situations. We treat all
          information with care, minimise what we collect, and never require
          personal details in order to access information on this site.
        </p>
      </Section>

      <Section id="changes" title="Changes to this notice">
        <p>
          We may update this notice as our services change. When we do, we will
          update the “last updated” date above.
        </p>
      </Section>

      <Section id="contact" title="Contact us">
        <p>
          Questions about this notice or your information? Email us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-bold text-primary underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p className="pt-2">
          <Link href="/" className="font-bold text-primary underline">
            ← Back to home
          </Link>
        </p>
      </Section>
    </div>
  );
}
