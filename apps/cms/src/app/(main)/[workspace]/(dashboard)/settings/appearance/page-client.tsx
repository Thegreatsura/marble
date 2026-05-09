"use client";

import { DesktopIcon } from "@phosphor-icons/react";
import { DashboardBody } from "@/components/layout/wrapper";
import { SettingsSection } from "@/components/settings/section";
import { ThemeSwitch } from "@/components/settings/theme";

function PageClient() {
  return (
    <DashboardBody className="flex flex-col gap-8 py-12" size="compact">
      <SettingsSection description="Choose your preferred theme." title="Theme">
        <div className="flex flex-col gap-3 rounded-[14px] bg-background px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <DesktopIcon className="size-4" />
            </div>
            <p className="text-muted-foreground text-sm">
              Defaults to your device theme.
            </p>
          </div>
          <ThemeSwitch />
        </div>
      </SettingsSection>
    </DashboardBody>
  );
}

export default PageClient;
