"use client";

import { Checkbox } from "@marble/ui/components/checkbox";
import {
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileVideoIcon,
} from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { type ElementType, memo, useMemo } from "react";
import { blurhashToDataUrl } from "@/lib/blurhash";
import type { Media, MediaType } from "@/types/media";
import { formatBytes } from "@/utils/string";
import { MediaActions } from "./media-actions";

interface MediaColumnsOptions {
  onDelete: (media: Media) => void;
}

const mediaTypeIcons: Record<MediaType, ElementType> = {
  image: FileImageIcon,
  video: FileVideoIcon,
  audio: FileAudioIcon,
  document: FileIcon,
};

function getMediaTypeLabel(media: Media) {
  return `${media.type.charAt(0).toUpperCase()}${media.type.slice(1)}`;
}

function getMediaDimensions(media: Media) {
  if (media.width && media.height) {
    return `${media.width} x ${media.height}`;
  }
  if (media.duration !== null) {
    return `${Math.round(media.duration / 1000)}s`;
  }
  return "-";
}

const MediaThumbnail = memo(function MediaThumbnail({
  media,
}: {
  media: Media;
}) {
  const Icon = mediaTypeIcons[media.type] || FileIcon;
  const blurDataUrl = useMemo(() => {
    if (media.type !== "image" || !media.blurHash) {
      return undefined;
    }
    return blurhashToDataUrl(media.blurHash);
  }, [media.blurHash, media.type]);

  if (media.type === "image") {
    return (
      <div className="relative size-11 overflow-hidden rounded-md bg-muted">
        <Image
          alt=""
          blurDataURL={blurDataUrl}
          className="size-full object-cover"
          decoding="async"
          height={48}
          placeholder={blurDataUrl ? "blur" : "empty"}
          sizes="48px"
          src={media.url}
          unoptimized
          width={48}
        />
      </div>
    );
  }

  return (
    <div className="grid size-12 place-items-center rounded-lg border border-dashed bg-[length:8px_8px] bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.05)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.05)_75%,rgba(0,0,0,0.05))] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05))]">
      <Icon className="size-5 text-primary" weight="duotone" />
    </div>
  );
});

export function getMediaColumns({
  onDelete,
}: MediaColumnsOptions): ColumnDef<Media>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-checked={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
              ? "mixed"
              : undefined
          }
          aria-label={
            table.getIsAllPageRowsSelected() ? "Deselect all" : "Select all"
          }
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
    {
      id: "file",
      accessorKey: "name",
      header: "File",
      cell: ({ row }) => (
        <div className="flex min-w-64 items-center gap-3">
          <MediaThumbnail media={row.original} />
          <div className="min-w-0 max-w-48">
            <p className="truncate font-medium text-xs">{row.original.name}</p>
            <p className="text-muted-foreground text-xs">
              {getMediaTypeLabel(row.original)}
            </p>
          </div>
        </div>
      ),
      meta: {
        label: "File",
      },
    },
    {
      id: "alt",
      accessorKey: "alt",
      header: "Alt text",
      cell: ({ row }) => (
        <p className="max-w-32 truncate text-muted-foreground text-xs">
          {row.original.alt || "-"}
        </p>
      ),
      meta: {
        label: "Alt text",
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Uploaded",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
      enableSorting: true,
      meta: {
        label: "Uploaded",
      },
    },
    {
      id: "size",
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatBytes(row.original.size)}
        </span>
      ),
      meta: {
        label: "Size",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <MediaActions media={row.original} onDelete={onDelete} />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 48,
    },
  ];
}
