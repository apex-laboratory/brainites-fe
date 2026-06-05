import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App toaster. Styling is driven by the Brainite design tokens so it
 * follows light/dark mode automatically via the CSS variables.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-line group-[.toaster]:shadow-soft-2 group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-ink-3",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-cream group-[.toast]:text-ink-2",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
