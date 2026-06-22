import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

// Used by the `sanity` CLI (`npx sanity ...`). Reads the same env as the app,
// so once NEXT_PUBLIC_SANITY_PROJECT_ID is set the CLI targets the same project.
export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "lisbon-project-lisboaux",
  autoUpdates: true,
});
