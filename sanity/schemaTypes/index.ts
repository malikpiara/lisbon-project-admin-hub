import { service } from "./service";
import { topic } from "./topic";
import { quickAccess } from "./quickAccess";
import { article } from "./article";
import { articleSection } from "./articleSection";
import { faq } from "./faq";
import { contact } from "./contact";

// Documents first, then the embedded object types they compose.
export const schemaTypes = [
  service,
  topic,
  quickAccess,
  article,
  articleSection,
  faq,
  contact,
];
