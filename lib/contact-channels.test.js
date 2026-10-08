import test from "node:test";
import assert from "node:assert/strict";

import { contactChannels, socialLink, telHref, websiteLink } from "./contact-channels.js";

test("legacy single phone/email read as one-item lists", () => {
  const c = contactChannels({ phone: " +351 961 740 421 ", email: "info@lisbonproject.org" });
  assert.deepEqual(c.phones, [{ number: "+351 961 740 421", label: "" }]);
  assert.deepEqual(c.emails, ["info@lisbonproject.org"]);
  assert.deepEqual(c.websites, []);
  assert.deepEqual(c.socials, []);
});

test("lists win over the legacy fields; empty rows are dropped", () => {
  const c = contactChannels({
    phone: "old",
    phones: [{ number: "144", label: "24h" }, { number: " " }],
    emails: [{ address: "a@b.pt" }, { address: "" }],
    websites: [{ url: "www.lisbonproject.org" }],
    socials: [{ network: "instagram", handle: "@lisbonproject" }, { network: "tiktok", handle: "x" }],
  });
  assert.deepEqual(c.phones, [{ number: "144", label: "24h" }]);
  assert.deepEqual(c.emails, ["a@b.pt"]);
  assert.equal(c.socials[1].network, "other");
});

test("links: tel strips formatting, websites get https and a clean label", () => {
  assert.equal(telHref("+351 961 740 421"), "tel:+351961740421");
  assert.deepEqual(websiteLink({ url: "www.lisbonproject.org/" }), { href: "https://www.lisbonproject.org/", label: "www.lisbonproject.org" });
  assert.deepEqual(websiteLink({ url: "https://x.pt/book", label: "Book online" }), { href: "https://x.pt/book", label: "Book online" });
});

test("socials: handles and full URLs both resolve", () => {
  assert.deepEqual(socialLink({ network: "instagram", handle: "@lisbonproject" }), { href: "https://instagram.com/lisbonproject", label: "@lisbonproject" });
  assert.deepEqual(socialLink({ network: "instagram", handle: "https://www.instagram.com/lisbonproject/" }), { href: "https://www.instagram.com/lisbonproject/", label: "@lisbonproject" });
  assert.deepEqual(socialLink({ network: "linkedin", handle: "Lisbonproject" }), { href: "https://www.linkedin.com/company/Lisbonproject", label: "Lisbonproject" });
  assert.deepEqual(socialLink({ network: "whatsapp", handle: "+351 961 740 421" }), { href: "https://wa.me/351961740421", label: "+351 961 740 421" });
  assert.equal(socialLink({ network: "other", handle: "tiktok.com/@lp" }).href, "https://tiktok.com/@lp");
});
