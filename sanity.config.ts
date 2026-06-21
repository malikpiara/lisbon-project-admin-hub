"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { lisbonTheme } from "./sanity/lib/theme";
import { structure } from "./sanity/structure";
import { StudioLogo } from "./sanity/components/StudioLogo";

// Drives the embedded Studio mounted at /studio (see
// app/(studio)/studio/[[...tool]]/page.tsx).
export default defineConfig({
  name: "lisbon-project",
  title: "Lisbon Project — Sanity",
  basePath: "/studio",
  projectId,
  dataset,
  theme: lisbonTheme,
  studio: { components: { logo: StudioLogo } },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: { types: schemaTypes },
});
