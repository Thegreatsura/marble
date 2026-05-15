import { db } from "@marble/db";
import { NextResponse } from "next/server";
import { getServerSession } from "./session";

export async function requireActiveWorkspaceAccess() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    } as const;
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
    return {
      error: NextResponse.json(
        { error: "You no longer have access to this workspace" },
        { status: 403 }
      ),
    } as const;
  }

  return {
    member,
    sessionData,
    workspaceId,
  } as const;
}
