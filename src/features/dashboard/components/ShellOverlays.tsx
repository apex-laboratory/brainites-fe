import { AppIcon, StatusIndicator } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BRAND } from "@/constants/brand";
import type { Disclosure } from "@/hooks/useDisclosure";

export interface ShellOverlaysProps {
  commandPalette: Disclosure;
  brainChat: Disclosure;
}

/**
 * Shell-level overlays driven by the global ⌘K / ⌘/ shortcuts.
 *
 * Phase 4 wires the open state and keyboard handling; the full command palette
 * and brain chat experiences are built in Phase 6. These are intentionally
 * minimal, accessible placeholders so the chrome is verifiably connected.
 */
export function ShellOverlays({ commandPalette, brainChat }: ShellOverlaysProps) {
  return (
    <>
      <Dialog open={commandPalette.isOpen} onOpenChange={commandPalette.setOpen}>
        <DialogContent className="top-[18%] max-w-[580px] translate-y-0 gap-0 p-0">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <AppIcon name="search" size={20} className="text-ink-4" />
            <DialogTitle className="text-base font-medium text-ink-3">
              Ask your brain or search…
            </DialogTitle>
          </div>
          <div className="px-5 py-8 text-center">
            <DialogDescription className="text-sm text-ink-4">
              The command palette arrives in Phase 6.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={brainChat.isOpen} onOpenChange={brainChat.setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-[400px]"
        >
          <SheetHeader className="gap-2 border-b border-line p-5">
            <SheetTitle className="flex items-center gap-2 text-base">
              <AppIcon name="brain" size={18} className="text-brand" />
              Ask {BRAND.name}
            </SheetTitle>
            <StatusIndicator tone="live" label="Reading 5 sources · live" pulse />
            <SheetDescription className="sr-only">
              Brain chat panel
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 place-items-center px-6 text-center">
            <p className="text-sm text-ink-4">
              Brain chat arrives in Phase 6.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
