"use client";

import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
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
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Quick Access cards
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            Shown in the home page hero. Each card links to a destination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetSection("quickAccess")}
          >
            <RotateCcw />
            Reset
          </Button>
          <Button size="sm" onClick={addQuickAccess}>
            <Plus />
            Add card
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.quickAccess.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col gap-4 px-4 xl:px-6">
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
              <div className="flex items-center justify-between border-t-2 border-border pt-3">
                <label className="flex items-center gap-2 text-ds-xs font-medium text-foreground">
                  <Checkbox
                    checked={item.external}
                    onCheckedChange={(checked) =>
                      updateQuickAccess(item.id, { external: checked === true })
                    }
                  />
                  Opens in a new tab (external link)
                </label>
                <DeleteButton onConfirm={() => removeQuickAccess(item.id)} />
              </div>
            </div>
          </Card>
        ))}
        {data.quickAccess.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            No Quick Access cards. Click &ldquo;Add card&rdquo; to create one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
