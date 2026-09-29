import { FlaskConical } from "lucide-react";

import { Tag } from "@/components/ui/tag";

// Marks a panel that is showing built-in example numbers, not live analytics —
// so a demo count is never mistaken for a real one (see /admin/insights).
export function SampleDataBadge() {
  return (
    <Tag className="border-amber-300 bg-amber-50 text-amber-800">
      <FlaskConical aria-hidden />
      Sample data
    </Tag>
  );
}
