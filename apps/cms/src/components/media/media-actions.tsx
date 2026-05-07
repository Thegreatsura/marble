"use client";

import {
  Copy01Icon,
  Delete02Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@marble/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@marble/ui/components/dropdown-menu";
import { toast } from "@marble/ui/components/sonner";
import { memo } from "react";
import type { Media } from "@/types/media";

interface MediaActionsProps {
  media: Media;
  onDelete: (media: Media) => void;
}

async function copyMediaUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Copied media URL");
  } catch {
    toast.error("Could not copy media URL");
  }
}

export const MediaActions = memo(function MediaActions({
  media,
  onDelete,
}: MediaActionsProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="size-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              variant="ghost"
            >
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              copyMediaUrl(media.url);
            }}
          >
            <HugeiconsIcon className="mr-2 size-4" icon={Copy01Icon} />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onDelete(media);
            }}
            variant="destructive"
          >
            <HugeiconsIcon className="mr-2 size-4" icon={Delete02Icon} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
