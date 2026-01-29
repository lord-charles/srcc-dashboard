"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CoachAssignment, Project, ProjectMilestone } from "@/types/project";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteCoach, deleteCoachManager } from "@/services/projects-service";

interface CoachesSectionProps {
  projectId: string;
  projectData: Project;
}

function groupCoachesByMilestone(coaches: CoachAssignment[] = [], milestones: ProjectMilestone[] = []) {
  const byId = new Map<string, ProjectMilestone>();
  milestones.forEach((m) => byId.set(m._id, m));
  const grouped = new Map<string, { milestone: ProjectMilestone | null; coaches: CoachAssignment[] }>();
  coaches.forEach((c) => {
    const key = c.milestoneId || "unknown";
    if (!grouped.has(key)) grouped.set(key, { milestone: byId.get(key) || null, coaches: [] });
    grouped.get(key)!.coaches.push(c);
  });
  return Array.from(grouped.entries()).map(([id, data]) => ({ id, ...data }));
}

export const CoachesSection: React.FC<CoachesSectionProps> = ({ projectId, projectData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const groups = groupCoachesByMilestone(projectData.coaches || [], projectData.milestones || []);
  const goToAddCoach = () => {
    const params = new URLSearchParams({
      projectId: projectData._id,
      projectName: projectData.name,
      returnUrl: `${window.location.pathname}?tab=team`,
      isCoach: "true",
    });
    router.push(`/users?${params.toString()}`);
  };

  const handleRemoveCoach = async (coach: any) => {
    try {
      const userId = typeof coach.userId === 'string' ? coach.userId : (coach.userId?._id || '');
      if (!userId || !coach.milestoneId) throw new Error('Missing coach identifiers');
      await deleteCoach(projectId, String(coach.milestoneId), String(userId));
      toast({ title: 'Coach removed', description: 'Coach has been removed from the milestone.' });
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to remove coach', variant: 'destructive' });
    }
  };

  const handleRemoveCoachManager = async (manager: any) => {
    try {
      const userId = typeof manager.userId === 'string' ? manager.userId : (manager.userId?._id || '');
      if (!userId) throw new Error('Missing manager user');
      await deleteCoachManager(projectId, String(userId));
      toast({ title: 'Coach manager removed', description: 'Coach manager has been removed.' });
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to remove coach manager', variant: 'destructive' });
    }
  };

  const goToAddCoachManager = () => {
    const params = new URLSearchParams({
      projectId: projectData._id,
      projectName: projectData.name,
      returnUrl: `${window.location.pathname}?tab=team`,
      isCoachManager: "true",
    });
    router.push(`/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Coaches by Milestone
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goToAddCoachManager}>Add Coach Manager</Button>
          <Button size="sm" onClick={goToAddCoach}>Add Coach</Button>
        </div>
      </div>

      {/* Coach Managers */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Coach Managers</h3>
          <Button size="sm" variant="outline" onClick={goToAddCoachManager}>Add</Button>
        </div>
        {(!projectData.coachManagers || projectData.coachManagers.length === 0) ? (
          <p className="text-sm text-muted-foreground">No coach managers yet.</p>
        ) : (
          <div className="grid gap-2">
            {projectData.coachManagers.map((m: any) => {
              const u: any = m.userId;
              const displayName = u && typeof u === 'object' && 'firstName' in u
                ? `${u.firstName} ${u.lastName}`
                : (typeof u === 'string' ? u : (u?._id || 'Unknown'));
              const initials = u && typeof u === 'object' && 'firstName' in u
                ? `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`
                : (typeof displayName === 'string' ? displayName.slice(0,2).toUpperCase() : 'CM');
              const assigned = m.assignedDate ? new Date(m.assignedDate) : undefined;
              return (
                <div key={m._id || displayName} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-medium">{displayName}</div>
                      {assigned && (
                        <div className="text-xs text-muted-foreground">Assigned {assigned.toLocaleDateString()}</div>
                      )}
                      {Array.isArray(m.responsibilities) && m.responsibilities.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {m.responsibilities.map((r: string) => (
                            <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={goToAddCoachManager}>Change</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove coach manager?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCoachManager(m)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {groups.length === 0 && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">No coaches assigned yet.</p>
        </Card>
      )}

      {groups.length > 0 && (
        <div className="space-y-6">
      {groups.map((g) => (
        <Card key={g.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">
                {g.milestone ? g.milestone.title : "Unknown Milestone"}
              </h3>
              {g.milestone && (
                <p className="text-xs text-muted-foreground">
                  Due {new Date(g.milestone.dueDate).toLocaleDateString()} • Budget {g.milestone.budget.toLocaleString()} {projectData.currency}
                </p>
              )}
            </div>
          </div>
          <Separator className="my-3" />
          <div className="grid gap-3">
            {g.coaches.map((c) => (
              <div key={c._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(() => {
                        const u: any = c.userId;
                        if (u && typeof u === 'object' && 'firstName' in u) return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`;
                        const s = typeof u === 'string' ? u : (u?._id || 'U');
                        return s.slice(0,2).toUpperCase();
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {(() => {
                        const u: any = c.userId;
                        if (u && typeof u === 'object' && 'firstName' in u) return `${u.firstName} ${u.lastName}`;
                        return typeof u === 'string' ? u : (u?._id || 'Unknown User');
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : ""}
                      {c.endDate ? ` — ${new Date(c.endDate).toLocaleDateString()}` : ""}
                    </div>
                    {c.responsibilities?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.responsibilities.map((r) => (
                          <Badge key={r} variant="secondary" className="text-[10px]">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">
                    {c.contract.rate.toLocaleString()} {c.contract.currency} {c.contract.rateUnit === "per_session" ? "/ session" : "/ hour"}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove coach?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the coach from this milestone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveCoach(c)}>Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
        </div>
      )}
    </div>
  );
};
