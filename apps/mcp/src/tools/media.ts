import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  deleteJsonApi,
  readJsonApi,
  uploadMediaApi,
  writeJsonApi,
} from "@/lib/api";
import { toolResult } from "@/lib/mcp";
import {
  destructiveAnnotations,
  paginationInput,
  readOnlyAnnotations,
} from "./shared";

const mediaType = z.enum(["image", "video", "audio", "document"]);
const MAX_REMOTE_MEDIA_BYTES = 5 * 1024 * 1024;
const REMOTE_MEDIA_FETCH_TIMEOUT_MS = 10_000;

const mediaIdentifierInput = {
  id: z.string().min(1).describe("Media asset ID."),
};

const updateMediaBody = {
  name: z.string().min(1).optional().describe("Updated media display name."),
  alt: z
    .string()
    .nullable()
    .optional()
    .describe("Updated image alt text. Use null to clear it."),
};

function filenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").filter(Boolean).at(-1);
    return filename || "media-upload";
  } catch {
    return "media-upload";
  }
}

function rawApiKey(apiKey: string) {
  return apiKey.replace(/^Bearer\s+/i, "").trim();
}

function assertPrivateApiKey(apiKey: string) {
  if (!rawApiKey(apiKey).startsWith("msk")) {
    throw new Error(
      "upload_media_from_url requires a private Marble API key (msk_...)."
    );
  }
}

function assertAllowedRemoteUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Remote media URL must use HTTP or HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.")
  ) {
    throw new Error("Remote media URL cannot target a private host.");
  }

  const ipv4Match = /^172\.(\d{1,3})\./.exec(hostname);
  if (ipv4Match) {
    const secondOctet = Number(ipv4Match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      throw new Error("Remote media URL cannot target a private host.");
    }
  }
}

async function fetchRemoteMedia(url: string) {
  const remoteUrl = new URL(url);
  assertAllowedRemoteUrl(remoteUrl);

  const response = await fetch(remoteUrl, {
    redirect: "error",
    signal: AbortSignal.timeout(REMOTE_MEDIA_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media URL: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (contentLength > MAX_REMOTE_MEDIA_BYTES) {
    throw new Error("Remote media files are limited to 5 MiB.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return response.blob();
  }

  let receivedBytes = 0;
  const chunks: ArrayBuffer[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_REMOTE_MEDIA_BYTES) {
      await reader.cancel();
      throw new Error("Remote media files are limited to 5 MiB.");
    }

    chunks.push(
      value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)
    );
  }

  return new Blob(chunks, {
    type: response.headers.get("content-type") ?? undefined,
  });
}

export function registerMediaTools(
  server: McpServer,
  apiBaseUrl: string,
  apiKey: string
) {
  server.registerTool(
    "get_media",
    {
      title: "Get Media",
      description: "Get a paginated list of media assets.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        ...paginationInput,
        order: z.enum(["asc", "desc"]).optional().describe("Sort order."),
        type: mediaType.optional().describe("Filter by media type."),
        query: z
          .string()
          .optional()
          .describe("Search by name, alt text, URL, or MIME type."),
      },
    },
    async (params) =>
      toolResult(await readJsonApi(apiBaseUrl, apiKey, "/v1/media", params))
  );

  server.registerTool(
    "get_media_asset",
    {
      title: "Get Media Asset",
      description: "Get a single media asset by ID.",
      annotations: readOnlyAnnotations,
      inputSchema: mediaIdentifierInput,
    },
    async ({ id }) =>
      toolResult(
        await readJsonApi(
          apiBaseUrl,
          apiKey,
          `/v1/media/${encodeURIComponent(id)}`
        )
      )
  );

  server.registerTool(
    "upload_media_from_url",
    {
      title: "Upload Media From URL",
      description:
        "Fetch a remote file URL and upload it to Marble. Requires a private Marble API key. The Marble API currently accepts files up to 5 MiB.",
      inputSchema: {
        url: z.url().describe("Remote file URL to fetch and upload."),
        filename: z
          .string()
          .min(1)
          .optional()
          .describe("Optional filename to use for the uploaded asset."),
      },
    },
    async ({ url, filename }) => {
      assertPrivateApiKey(apiKey);

      const blob = await fetchRemoteMedia(url);
      return toolResult(
        await uploadMediaApi(
          apiBaseUrl,
          apiKey,
          blob,
          filename ?? filenameFromUrl(url)
        )
      );
    }
  );

  server.registerTool(
    "update_media",
    {
      title: "Update Media",
      description:
        "Update media asset metadata. Requires a private Marble API key.",
      annotations: destructiveAnnotations,
      inputSchema: {
        ...mediaIdentifierInput,
        body: z.object(updateMediaBody),
      },
    },
    async ({ id, body }) =>
      toolResult(
        await writeJsonApi(
          apiBaseUrl,
          apiKey,
          "PATCH",
          `/v1/media/${encodeURIComponent(id)}`,
          body
        )
      )
  );

  server.registerTool(
    "delete_media",
    {
      title: "Delete Media",
      description:
        "Delete a media asset and its stored file. Requires a private Marble API key.",
      annotations: destructiveAnnotations,
      inputSchema: mediaIdentifierInput,
    },
    async ({ id }) =>
      toolResult(
        await deleteJsonApi(
          apiBaseUrl,
          apiKey,
          `/v1/media/${encodeURIComponent(id)}`
        )
      )
  );
}
