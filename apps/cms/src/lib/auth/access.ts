import { db } from "@marble/db";
import { getServerSession } from "./session";

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
