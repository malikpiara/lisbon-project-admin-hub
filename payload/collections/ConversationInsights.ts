import type { CollectionConfig } from "payload";

// Durable "analyse once" store for help-assistant conversation insights.
//
// The conversations themselves live in PostHog as immutable events
// (chatbot_conversation_logged) — there is no row to write an insight back onto.
// So each AI-synthesised insight (need / theme / status / summary) is cached
// here, content-addressed by a hash of the (redacted) transcript. Keying on the
// transcript rather than the conversationId matters: many logged conversations
// carry no conversation_id at all, and identical transcripts should share one
// insight. An unchanged transcript is read straight from Postgres and never
// touches the AI again; a conversation that later grows hashes differently and
// is synthesised afresh. Only AI results are stored — the heuristic is cheap and
// deterministic, and caching it would pin the team to it once the AI comes
// online. Written only via the Local API (buildConversationsView); never edited
// by hand.
export const ConversationInsights: CollectionConfig = {
  slug: "conversation-insights",
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false, // Local API only (buildConversationsView)
    update: () => false,
    delete: () => false,
  },
  labels: { singular: "Conversation insight", plural: "Conversation insights" },
  admin: {
    useAsTitle: "need",
    defaultColumns: ["need", "theme", "status", "conversationId", "updatedAt"],
    group: "System",
    hidden: true, // internal cache — keep it out of the CMS nav
  },
  fields: [
    {
      name: "transcriptHash",
      type: "text",
      required: true,
      unique: true, // the cache key — one insight per distinct transcript
      index: true,
      admin: { description: "Hash of the transcript the insight was derived from" },
    },
    {
      name: "conversationId",
      type: "text",
      index: true, // reference only — often empty, never unique
      admin: { description: "PostHog conversation_id, when the log carried one" },
    },
    { name: "need", type: "text", required: true },
    { name: "theme", type: "text", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      options: ["resolved", "needs_follow_up", "bot_gap"],
    },
    { name: "summary", type: "text", required: true },
    { name: "language", type: "text" },
    {
      name: "model",
      type: "text",
      admin: { description: "Provider/model that produced this insight (provenance)" },
    },
  ],
};
