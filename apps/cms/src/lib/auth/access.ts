import { db } from "@marble/db";
import { getServerSession } from "./session";

export class WorkspaceAccessError extends Error {
  status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "WorkspaceAccessError";
    this.status = status;
  }
}

export async function requireActiveWorkspaceAccess() {
  const sessionData = await getServerSession();
  const workspaceId = sessionData?.session.activeOrganizationId;

  if (!sessionData || !workspaceId) {
    throw new WorkspaceAccessError("Not authenticated", 401);
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
    throw new WorkspaceAccessError(
      "You no longer have access to this workspace",
      403
    );
  }

  return {
    member,
    sessionData,
    workspaceId,
  } as const;
}
