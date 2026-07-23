import { useState } from "react";
import { toast } from "sonner";

import { isApiError } from "@/lib/api";

import { exportSkills } from "../api";

/**
 * Downloads the published-skills bundle (`GET /skills/export`) and saves it as a
 * file. Admin-only on the backend — a non-admin's 403 surfaces as a toast. The
 * object URL is revoked once the download has been triggered.
 */
export function useExportSkills() {
  const [isExporting, setIsExporting] = useState(false);

  const exportBundle = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { blob, filename } = await exportSkills();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Export ready", { description: `Downloaded ${filename}.` });
    } catch (err) {
      toast.error(
        isApiError(err) && err.code === "forbidden"
          ? "Export is admin-only."
          : isApiError(err)
            ? err.message
            : "Couldn't export skills.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return { exportBundle, isExporting };
}
