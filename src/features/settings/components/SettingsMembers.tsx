import { AppIcon, NiceAvatar } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WORKSPACE } from "@/features/dashboard/data/workspace";
import { cn } from "@/utils/cn";

import { MEMBERS } from "../data/members";
import { InviteMemberDialog } from "./InviteMemberDialog";

/** Settings → Members tab: team roster with roles. */
export function SettingsMembers() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-4">
        <div>
          <div className="text-[15px] font-bold text-ink">Members</div>
          <div className="mt-0.5 text-[12.5px] text-ink-3">
            {MEMBERS.length} of {WORKSPACE.memberCount} seats used
          </div>
        </div>
        <InviteMemberDialog
          trigger={
            <Button variant="solid" size="sm" className="ml-auto">
              <AppIcon name="plus" size={15} />
              Invite
            </Button>
          }
        />
      </div>

      {MEMBERS.map((member, i) => (
        <div
          key={member.email}
          className={cn(
            "flex items-center gap-3 px-5 py-3.5",
            i && "border-t border-line-soft"
          )}
        >
          <NiceAvatar name={member.name} size={34} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {member.name}
              {member.you && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  You
                </Badge>
              )}
            </div>
            <div className="text-[12.5px] text-ink-3">{member.email}</div>
          </div>
          <Badge
            variant={member.role === "Admin" ? "accent" : "default"}
          >
            {member.role}
          </Badge>
        </div>
      ))}
    </Card>
  );
}
