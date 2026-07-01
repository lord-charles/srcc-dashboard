export function hasProjectAccess(
  project: any,
  userId: string | undefined,
  roles: string[] | undefined,
): boolean {
  if (!userId) return false;

  const userRoles = roles || [];
  const hasAdminRole = userRoles.some((r) => r === "admin" || r === "super_admin");
  if (hasAdminRole) return true;

  if (!project) return false;

  // Project Manager
  const pmId = project.projectManagerId?._id || project.projectManagerId;
  if (pmId === userId) return true;

  // Assistant PMs
  const isAssistantPm = project.assistantProjectManagers?.some(
    (apm: any) => (apm?.userId?._id || apm?.userId || apm) === userId,
  );
  if (isAssistantPm) return true;

  // Coach Managers
  const isCoachManager = project.coachManagers?.some(
    (cm: any) => (cm?.userId?._id || cm?.userId || cm) === userId,
  );
  if (isCoachManager) return true;

  // Coach Assistants
  const isCoachAssistant = project.coachAssistants?.some(
    (ca: any) => (ca?.userId?._id || ca?.userId || ca) === userId,
  );
  if (isCoachAssistant) return true;

  return false;
}
