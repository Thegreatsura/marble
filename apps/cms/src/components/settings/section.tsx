import { Card, CardDescription, CardTitle } from "@marble/ui/components/card";
import type { ReactNode } from "react";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-1 rounded-[20px] border-none bg-surface p-1.5">
      <div className="flex flex-col gap-0.5 px-4 py-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <CardDescription className="text-[13px]">{description}</CardDescription>
      </div>
      {children}
    </Card>
  );
}
