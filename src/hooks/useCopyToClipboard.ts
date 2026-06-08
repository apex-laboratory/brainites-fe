import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Copies text to the clipboard and surfaces a toast. Reused anywhere the app
 * exposes a copyable value (endpoint, API key, system prompt, config).
 */
export function useCopyToClipboard() {
  const copy = useCallback(
    async (value: string, label = "Copied to clipboard") => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(label);
      } catch {
        toast.error("Couldn't copy to clipboard");
      }
    },
    []
  );

  return { copy };
}
