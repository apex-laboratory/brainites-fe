import {
  AppIcon,
  SectionLabel,
  SourceIcon,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { asSourceId } from "@/constants/sources";
import { formatRelativeTime } from "@/utils/date";

import { asStatus } from "../mappers";
import type { SkillListItem } from "../api";

/**
 * `exceptionsBlock` is a bare list on the backend with no committed element
 * shape (mirrors `SkillDetailDialog`'s `RawBlock`).
 */
function RawBlock({ items }: { items: unknown[] }) {
  return (
    <pre className="max-h-52 overflow-auto rounded-[10px] bg-cream px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-ink-2">
      {JSON.stringify(items, null, 2)}
    </pre>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="pb-0">{label}</SectionLabel>
      {children}
    </div>
  );
}

export interface DraftDetailDialogProps {
  /**
   * The draft row to inspect, straight from the `GET /skills?status=draft`
   * list — `/skills/{id}` is published-only and 404s on a draft, so there's
   * nothing to fetch here. `null` keeps the dialog closed.
   */
  item: SkillListItem | null;
  onClose: () => void;
}

/**
 * Read-only draft inspector. Skills below the review-queue confidence floor
 * never get a `reviews` row, so unlike a published skill there's no version
 * history and no live endpoint to poll — this just renders the list row.
 */
export function DraftDetailDialog({ item, onClose }: DraftDetailDialogProps) {
  const authority = asSourceId(item?.sourceAuthority);

  return (
    <Dialog open={item !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[640px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2.5">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-cream text-brand">
              <AppIcon name="skills" size={16} />
            </span>
            {item?.name ?? "Skill"}
            {item && (
              <>
                <Badge variant="outline" className="tnum">
                  {item.version}
                </Badge>
                <StatusBadge status={asStatus(item.status)} />
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Below the review-queue confidence floor — extracted, but not queued
            for approval.
            {item?.updatedAt
              ? ` Captured ${formatRelativeTime(item.updatedAt) ?? "recently"}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="flex flex-col gap-5">
            <Field label="Base logic">
              <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                {item.baseLogic || "—"}
              </p>
            </Field>

            {item.exceptionsBlock.length > 0 && (
              <Field label={`Exceptions · ${item.exceptionsBlock.length}`}>
                <RawBlock items={item.exceptionsBlock} />
              </Field>
            )}

            {item.description && (
              <Field label="Notes">
                <p className="text-[13.5px] leading-relaxed text-ink-2">
                  {item.description}
                </p>
              </Field>
            )}

            {authority && (
              <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                <SourceIcon id={authority} size={16} branded />
                Source of authority
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
