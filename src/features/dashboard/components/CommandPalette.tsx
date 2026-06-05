import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppIcon, type AppIconName } from "@/components/shared";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import { NAV_KNOWLEDGE, NAV_MAIN } from "../data/navigation";
import { RECENT_QUESTIONS } from "../data/recent-questions";

type NavTarget = { key: string; label: string; icon: AppIconName; path: string };

const NAV: NavTarget[] = [
  ...NAV_MAIN,
  ...NAV_KNOWLEDGE,
  { key: "settings", label: "Settings", icon: "settings", path: ROUTES.settings },
];

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ask the brain with a query (opens chat). */
  onAsk: (question: string) => void;
}

/** Row icon tile, accent variant for the "Ask" action. */
function RowIcon({ icon, accent }: { icon: AppIconName; accent?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-[30px] shrink-0 place-items-center rounded-lg",
        accent
          ? "bg-brand text-white"
          : "border border-line bg-paper text-ink-3"
      )}
    >
      <AppIcon name={icon} size={16} />
    </span>
  );
}

/**
 * ⌘K command palette (prototype `CommandPalette`): ask the brain, jump to a
 * page, or rerun a recent question. Filtering is manual so the "Ask" row is
 * always offered while a query is present.
 */
export function CommandPalette({ open, onOpenChange, onAsk }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };

  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const navMatches = NAV.filter((item) => item.label.toLowerCase().includes(q));
  const recentMatches = RECENT_QUESTIONS.filter((item) =>
    item.toLowerCase().includes(q)
  );

  const ask = (text: string) => {
    handleOpenChange(false);
    onAsk(text);
  };

  const goTo = (path: string) => {
    handleOpenChange(false);
    navigate(path);
  };

  const nothing = !trimmed && navMatches.length === 0 && recentMatches.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className="top-[16%] max-w-[580px] translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Ask your brain, jump to a page, or rerun a recent question.
        </DialogDescription>
        <Command shouldFilter={false} className="bg-popover">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Ask your brain or search…"
          />
          <CommandList className="max-h-[360px] p-2">
            {trimmed && (
              <CommandItem
                value="ask"
                onSelect={() => ask(trimmed)}
                className="h-11 gap-3 px-2"
              >
                <RowIcon icon="brain" accent />
                <span className="flex-1 truncate font-semibold text-ink">
                  Ask: “{trimmed}”
                </span>
                <kbd className="ml-auto text-xs text-ink-4">↵</kbd>
              </CommandItem>
            )}

            {navMatches.length > 0 && (
              <CommandGroup heading="Go to">
                {navMatches.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={`nav-${item.key}`}
                    onSelect={() => goTo(item.path)}
                    className="h-11 gap-3 px-2"
                  >
                    <RowIcon icon={item.icon} />
                    <span className="flex-1 truncate font-medium text-ink">
                      {item.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentMatches.length > 0 && (
              <CommandGroup heading="Recent questions">
                {recentMatches.map((question) => (
                  <CommandItem
                    key={question}
                    value={`recent-${question}`}
                    onSelect={() => ask(question)}
                    className="h-11 gap-3 px-2"
                  >
                    <RowIcon icon="clock" />
                    <span className="flex-1 truncate text-ink">{question}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {nothing && (
              <div className="py-6 text-center text-sm text-ink-4">
                Type to search
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
