import { cn } from "@marble/ui/lib/utils";
import type { HTMLAttributes } from "react";

export interface LastUsedBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  show?: boolean;
  text?: string;
  variant?: string;
  position?: string;
}

export function LastUsedBadge({
  className,
  variant: _variant,
  position: _position,
  show = false,
  text,
  ...props
}: LastUsedBadgeProps) {
  if (!show) {
    return null;
  }

  return (
    <span
      className={cn(
        "-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-[11px] text-muted-foreground",
        className
      )}
      {...props}
    >
      {text ?? "Last Used"}
    </span>
  );
}
