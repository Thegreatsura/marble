import { db } from "@marble/db";
import { NextResponse } from "next/server";
import { getServerSession } from "./session";

export function handleWorkspaceAccessError(error: unknown) {
  if (error instanceof Error && error.message === "Not authenticated") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (
    error instanceof Error &&
    error.message === "You no longer have access to this workspace"
  ) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  throw error;
}

export async function requireActiveWorkspaceAccess() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    throw new Error("Not authenticated");
  }

  const member = await db.member.findFirst({
    where: {
      organizationId: workspaceId,
      userId: sessionData.user.id,
    },
    select: {
      id: true,
      role: true,
      userId: true,
      organizationId: true,
    },
  });

  if (!member) {
    throw new Error("You no longer have access to this workspace");
  }

  return {
    member,
    sessionData,
    workspaceId,
  } as const;
}
