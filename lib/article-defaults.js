// Mock article body for a topic. A real headless CMS would own this content;
// until a topic has its own `article`, both the public page and the admin editor
// fall back to this default (and editing "materialises" it into the store).

export function defaultArticle(topic) {
  const lead = topic?.description ?? "";
  return {
    heroLead:
      "Connecting community members to external services and internal resources.",
    sections: [
      {
        heading: "What is it?",
        lead,
        body: "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam. However, prior to the mandatory entrance, after turning 3, members can enter the relevant process, which is organized into different stages:",
        bullets: [
          "an initial registration step, where eligibility is confirmed;",
          "a documentation step, gathering the required paperwork;",
          "a submission step, where the application is reviewed;",
          "a follow-up step, to track the status of the request.",
        ].join("\n"),
        cta: "",
      },
      {
        heading: "Why would I need it?",
        lead: "Access to this service helps community members navigate the relevant administrative processes with confidence.",
        body: "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam. Lorem ipsum dolor sit amet consectetur.\n\nRisus id posuere ornare proin gravida egestas dictumst diam. Lorem ipsum dolor sit amet consectetur adipiscing elit.",
        bullets: "",
        cta: "Get Support Now",
      },
      {
        heading: "Step-by-Step guide",
        lead: "Follow these steps to access the service and get the support you need.",
        body: "",
        bullets: [
          "Review the requirements and confirm which organization is responsible for your request.",
          "Collect identification, proof of address, and any supporting documents listed below.",
          "Contact the service provider or visit during opening hours to start the process.",
          "Keep copies of submitted documents and note any reference numbers or follow-up dates.",
        ].join("\n"),
        ordered: true,
        cta: "",
      },
      {
        heading: "Documents Required",
        lead: "Bring the documents that prove identity, residence, and eligibility for this process.",
        body: "Requirements vary by organization, so confirm the list before your appointment or visit.",
        bullets: [
          "Identification document or passport",
          "Proof of address in Portugal",
          "Relevant certificates, forms, or previous case documents",
        ].join("\n"),
        cta: "",
      },
      {
        heading: "Community Tips and Learning",
        lead: "A few practical notes can make the process easier to complete.",
        body: "Arrive early when visiting public offices, keep digital and paper copies of key documents, and ask for written confirmation when a request is submitted.",
        bullets: [
          "Take a translator or trusted support person if language may be a barrier.",
          "Save phone numbers and email addresses for follow-up.",
          "Check whether appointments are required before travelling.",
        ].join("\n"),
        cta: "",
      },
    ],
    faqLead: "Find answers to common questions about this service.",
    faqs: [
      {
        question: "How do I register my child for public education?",
        answer:
          "In order to register, you need a valid LP profile in MyLP — you can create one in a few minutes. Registration is not first-come-first-served: it does not matter when you apply, as long as you do it within the required period. Our placement criteria help us prioritise families in more vulnerable situations.",
      },
      {
        question: "What family benefits am I entitled to?",
        answer:
          "Depending on your income and household, you may be eligible for childcare subsidies, school meal support, and family allowances. Contact us or visit during opening hours and we'll help you identify which benefits apply to your situation.",
      },
    ],
  };
}

// The body/bullets fields are edited as plain text; these split them for render.
/** @param {string} [text] @returns {string[]} */
export function splitParagraphs(text) {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** @param {string} [text] @returns {string[]} */
export function splitLines(text) {
  return (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
