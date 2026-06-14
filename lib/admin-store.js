"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultAdminData } from "./admin-default-data";

const STORAGE_KEY = "lp-admin-data-v1";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [data, setData] = useState(defaultAdminData);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch {
      // ignore parse / storage errors — fall back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedAt(Date.now());
    } catch {
      // ignore quota errors
    }
  }, [data, hydrated]);

  const updateQuickAccess = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      quickAccess: prev.quickAccess.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }, []);

  const addQuickAccess = useCallback(() => {
    setData((prev) => ({
      ...prev,
      quickAccess: [
        ...prev.quickAccess,
        {
          id: `qa-${Date.now()}`,
          title: "New card",
          description: "Describe this link",
          href: "/",
          external: false,
        },
      ],
    }));
  }, []);

  const removeQuickAccess = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      quickAccess: prev.quickAccess.filter((item) => item.id !== id),
    }));
  }, []);

  const updateService = useCallback((slug, patch) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug === slug ? { ...s, ...patch } : s,
      ),
    }));
  }, []);

  const addService = useCallback(() => {
    setData((prev) => {
      const newSlug = `new-service-${Date.now()}`;
      return {
        ...prev,
        services: [
          ...prev.services,
          {
            slug: newSlug,
            title: "New category",
            shortDescription: "Short description for the home grid card",
            breadcrumb: "New category",
            intro: [
              "Connecting community members to external services and internal resources.",
            ],
            tone: "teal",
            iconKey: "Building2",
            contactsTitle: "New category Contacts",
            contactsSubtitle: "Key contact information",
            topics: [],
            contacts: [],
            categoryFilters: [],
          },
        ],
      };
    });
  }, []);

  const removeService = useCallback((slug) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.slug !== slug),
    }));
  }, []);

  const updateTopic = useCallback((serviceSlug, topicSlug, patch) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : {
              ...s,
              topics: s.topics.map((t) =>
                t.slug === topicSlug ? { ...t, ...patch } : t,
              ),
            },
      ),
    }));
  }, []);

  const addTopic = useCallback((serviceSlug) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : {
              ...s,
              topics: [
                ...s.topics,
                {
                  slug: `topic-${Date.now()}`,
                  title: "New topic",
                  description: "Describe this topic",
                  tone: "teal",
                },
              ],
            },
      ),
    }));
  }, []);

  const setTopicArticle = useCallback((serviceSlug, topicSlug, article) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : {
              ...s,
              topics: s.topics.map((t) =>
                t.slug === topicSlug ? { ...t, article } : t,
              ),
            },
      ),
    }));
  }, []);

  const removeTopic = useCallback((serviceSlug, topicSlug) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : { ...s, topics: s.topics.filter((t) => t.slug !== topicSlug) },
      ),
    }));
  }, []);

  const updateContact = useCallback((serviceSlug, index, patch) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : {
              ...s,
              contacts: s.contacts.map((c, i) =>
                i === index ? { ...c, ...patch } : c,
              ),
            },
      ),
    }));
  }, []);

  const addContact = useCallback((serviceSlug) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : {
              ...s,
              contacts: [
                ...s.contacts,
                {
                  organization: "New organization",
                  service: "Describe the service",
                  phone: "+351 ",
                  email: "contact@example.pt",
                  category: s.categoryFilters[0] ?? "General",
                },
              ],
            },
      ),
    }));
  }, []);

  const removeContact = useCallback((serviceSlug, index) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.slug !== serviceSlug
          ? s
          : { ...s, contacts: s.contacts.filter((_, i) => i !== index) },
      ),
    }));
  }, []);

  const resetSection = useCallback((section) => {
    setData((prev) => ({ ...prev, [section]: defaultAdminData[section] }));
  }, []);

  const resetService = useCallback((slug) => {
    setData((prev) => {
      const fallback = defaultAdminData.services.find((s) => s.slug === slug);
      if (!fallback) return prev;
      return {
        ...prev,
        services: prev.services.map((s) =>
          s.slug === slug ? { ...fallback } : s,
        ),
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      data,
      hydrated,
      savedAt,
      updateQuickAccess,
      addQuickAccess,
      removeQuickAccess,
      updateService,
      addService,
      removeService,
      updateTopic,
      addTopic,
      setTopicArticle,
      removeTopic,
      updateContact,
      addContact,
      removeContact,
      resetSection,
      resetService,
    }),
    [
      data,
      hydrated,
      savedAt,
      updateQuickAccess,
      addQuickAccess,
      removeQuickAccess,
      updateService,
      addService,
      removeService,
      updateTopic,
      addTopic,
      setTopicArticle,
      removeTopic,
      updateContact,
      addContact,
      removeContact,
      resetSection,
      resetService,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be called inside <AdminProvider>");
  }
  return ctx;
}
