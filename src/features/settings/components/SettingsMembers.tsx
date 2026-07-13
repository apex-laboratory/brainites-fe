import { AppIcon, ErrorState, NiceAvatar, Skeleton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

import { ROLE_LABEL } from "../api";
import { useMembers, useSettings } from "../hooks";
import { InviteMemberDialog } from "./InviteMemberDialog";

/** Settings → Members tab: team roster with roles. */
export function SettingsMembers() {
  const { members, isPending, isError, error, refetch, invite } = useMembers();
  const { settings } = useSettings();
  const seatLimit = settings?.workspace.seatLimit;

  if (isPending) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        title="Couldn't load members"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-4">
        <div>
          <div className="text-[15px] font-bold text-ink">Members</div>
          <div className="mt-0.5 text-[12.5px] text-ink-3">
            {members.length}
            {seatLimit ? ` of ${seatLimit}` : ""} seats used
          </div>
        </div>
        <InviteMemberDialog
          pending={invite.isPending}
          onInvite={async (email, role) => {
            await invite.mutateAsync({ email, role });
          }}
          trigger={
            <Button variant="solid" size="sm" className="ml-auto">
              <AppIcon name="plus" size={15} />
              Invite
            </Button>
          }
        />
      </div>

      {members.map((member, i) => {
        const displayName = member.name ?? member.email;
        return (
          <div
            key={member.id}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5",
              i && "border-t border-line-soft"
            )}
          >
            <NiceAvatar name={displayName} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                {displayName}
                {member.isCurrentUser && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    You
                  </Badge>
                )}
              </div>
              <div className="text-[12.5px] text-ink-3">{member.email}</div>
            </div>
            <Badge variant={member.role === "admin" ? "accent" : "default"}>
              {ROLE_LABEL[member.role]}
            </Badge>
          </div>
        );
      })}
    </Card>
  );
}
