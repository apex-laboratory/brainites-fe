import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { exportSkills } from "../api";

/**
 * Downloads the published-skills bundle (`GET /skills/export`) and saves it as a
 * file. Admin-only on the backend; the 403 surfaces through the global error
 * toast. The object URL is revoked once the download has been triggered.
 */
export function useExportSkills() {
  const { mutate, isPending } = useMutation({
    mutationFn: exportSkills,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Export ready", { description: `Downloaded ${filename}.` });
    },
    meta: {
      errorMessage: "Couldn't export skills.",
      errorMessages: { forbidden: "Export is admin-only." },
    },
  });

  // Wrapped so callers can hand it straight to `onClick` without the event
  // landing in `mutate`'s variables slot.
  return { exportBundle: () => mutate(), isExporting: isPending };
}
