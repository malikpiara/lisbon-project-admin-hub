"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/admin/field";
import { useAdmin } from "@/lib/admin-store";

export default function QuickAccessAdminPage() {
  const {
    data,
    updateQuickAccess,
    addQuickAccess,
    removeQuickAccess,
    resetSection,
  } = useAdmin();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quick Access cards
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown in the home page hero. Each card links to a destination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => resetSection("quickAccess")}
            className="h-9 gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button onClick={addQuickAccess} className="h-9 gap-1.5">
            <Plus className="size-4" />
            Add card
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.quickAccess.map((item) => (
          <Card key={item.id} className="gap-4 border-border/60 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                value={item.title}
                onChange={(v) => updateQuickAccess(item.id, { title: v })}
              />
              <Field
                label="Link target"
                value={item.href}
                onChange={(v) => updateQuickAccess(item.id, { href: v })}
                placeholder="/path or https://…"
              />
              <Field
                className="sm:col-span-2"
                label="Description"
                value={item.description}
                onChange={(v) =>
                  updateQuickAccess(item.id, { description: v })
                }
                textarea
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <label className="flex items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={item.external}
                  onChange={(e) =>
                    updateQuickAccess(item.id, { external: e.target.checked })
                  }
                  className="size-4 rounded border-input accent-[color:var(--primary)]"
                />
                Opens in a new tab (external link)
              </label>
              <Button
                variant="ghost"
                onClick={() => removeQuickAccess(item.id)}
                className="h-8 gap-1.5 text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
        {data.quickAccess.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No Quick Access cards. Click "Add card" to create one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
