"use client";

import { Input } from "@marble/ui/components/input";
import { Label } from "@marble/ui/components/label";
import { useId } from "react";
import { SettingsSection } from "@/components/settings/section";
import { CopyButton } from "@/components/ui/copy-button";
import { useWorkspace } from "@/providers/workspace";

export function Id() {
  const { activeWorkspace } = useWorkspace();
  const linkId = useId();

  return (
    <SettingsSection
      description="Unique identifier of your workspace on Marble."
      title="Workspace ID"
    >
      <div className="flex items-center gap-2 rounded-[14px] bg-background px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <Label className="sr-only" htmlFor={linkId}>
            Workspace ID
          </Label>
          <Input id={linkId} readOnly value={activeWorkspace?.id || ""} />
        </div>
        <CopyButton
          textToCopy={activeWorkspace?.id || ""}
          toastMessage="ID copied to clipboard."
        />
      </div>
    </SettingsSection>
  );
}
