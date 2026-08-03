import { BrowserRouter } from "react-router-dom";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { AppRouter } from "@/app/router";
import { AppShell } from "@/components/shared/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { persistOptions, queryClient } from "@/lib/api";

export function App() {
  return (
    // Restores the last session's query cache from localStorage before the
    // first fetch, so a reload paints the shell *and* its data instead of a
    // screen of spinners. Every restored query is stale on arrival and
    // revalidates on mount — this buys first paint, not freshness.
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <AppShell>
                <AppRouter />
              </AppShell>
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
