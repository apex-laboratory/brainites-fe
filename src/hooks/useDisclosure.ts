import { useCallback, useMemo, useState } from "react";

export type Disclosure = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
};

/** Controls a boolean open/closed UI state (dialogs, sheets, menus). */
export function useDisclosure(initial = false): Disclosure {
  const [isOpen, setOpen] = useState(initial);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return useMemo(
    () => ({ isOpen, open, close, toggle, setOpen }),
    [isOpen, open, close, toggle]
  );
}
